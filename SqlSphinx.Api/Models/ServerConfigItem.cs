namespace SqlSphinx.Api.Models;

public class ServerConfigItem
{
    public string Name { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? ValueInUse { get; set; }
    public string? Description { get; set; }
    public string? Minimum { get; set; }
    public string? Maximum { get; set; }
    public bool IsDynamic { get; set; }
    public bool IsAdvanced { get; set; }
}
