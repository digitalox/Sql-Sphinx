namespace SqlSphinx.Api.Models;

public class ComparisonResult
{
    public ServerSnapshot Server1 { get; set; } = new();
    public ServerSnapshot Server2 { get; set; } = new();
    public List<ConfigDiff> Diffs { get; set; } = new();
    public int TotalSettings { get; set; }
    public int DifferentCount { get; set; }
    public int MatchingCount { get; set; }
}

public class ServerSnapshot
{
    public string ConnectionLabel { get; set; } = string.Empty;
    public ServerProperties Properties { get; set; } = new();
    public List<ServerConfigItem> Configs { get; set; } = new();
}

public class ConfigDiff
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Value1 { get; set; }
    public string? Value2 { get; set; }
    public bool IsDifferent { get; set; }
}
