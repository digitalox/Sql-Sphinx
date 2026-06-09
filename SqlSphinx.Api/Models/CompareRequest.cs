namespace SqlSphinx.Api.Models;

public class CompareRequest
{
    public string Server1ConnectionString { get; set; } = string.Empty;
    public string Server2ConnectionString { get; set; } = string.Empty;
}
