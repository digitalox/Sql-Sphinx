namespace SqlSphinx.Api.Models;

public class ServerProperties
{
    public string? ServerName { get; set; }
    public string? ProductVersion { get; set; }
    public string? ProductLevel { get; set; }
    public string? Edition { get; set; }
    public string? EngineEdition { get; set; }
    public string? Collation { get; set; }
    public string? MachineName { get; set; }
    public string? InstanceName { get; set; }
    public bool IsClustered { get; set; }
    public bool IsFullTextInstalled { get; set; }
}
