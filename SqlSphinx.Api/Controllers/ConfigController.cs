using Microsoft.AspNetCore.Mvc;
using SqlSphinx.Api.Models;
using SqlSphinx.Api.Services;

namespace SqlSphinx.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigController : ControllerBase
{
    private readonly SqlConfigService _service;
    private readonly IConfiguration _configuration;

    public ConfigController(SqlConfigService service, IConfiguration configuration)
    {
        _service = service;
        _configuration = configuration;
    }

    [HttpGet("defaults")]
    public IActionResult GetDefaults()
    {
        return Ok(new
        {
            server1 = _configuration.GetConnectionString("Server1") ?? string.Empty,
            server2 = _configuration.GetConnectionString("Server2") ?? string.Empty
        });
    }

    [HttpPost("compare")]
    public async Task<IActionResult> Compare([FromBody] CompareRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Server1ConnectionString) ||
            string.IsNullOrWhiteSpace(request.Server2ConnectionString))
            return BadRequest("Both connection strings are required.");

        try
        {
            var t1 = _service.FetchSnapshotAsync(request.Server1ConnectionString);
            var t2 = _service.FetchSnapshotAsync(request.Server2ConnectionString);
            await Task.WhenAll(t1, t2);
            var s1 = t1.Result;
            var s2 = t2.Result;

            var result = _service.Compare(s1, s2);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
