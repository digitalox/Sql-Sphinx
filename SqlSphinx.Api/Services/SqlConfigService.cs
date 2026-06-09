using Microsoft.Data.SqlClient;
using SqlSphinx.Api.Models;

namespace SqlSphinx.Api.Services;

public class SqlConfigService
{
    public async Task<ServerSnapshot> FetchSnapshotAsync(string connectionString)
    {
        var snapshot = new ServerSnapshot { ConnectionLabel = GetServerLabel(connectionString) };

        await using var conn = new SqlConnection(connectionString);
        await conn.OpenAsync();

        snapshot.Properties = await FetchPropertiesAsync(conn);
        snapshot.Configs = await FetchConfigsAsync(conn);

        return snapshot;
    }

    public ComparisonResult Compare(ServerSnapshot s1, ServerSnapshot s2)
    {
        var allNames = s1.Configs.Select(c => c.Name)
            .Union(s2.Configs.Select(c => c.Name))
            .OrderBy(n => n)
            .ToList();

        var dict1 = s1.Configs.ToDictionary(c => c.Name);
        var dict2 = s2.Configs.ToDictionary(c => c.Name);

        var diffs = allNames.Select(name =>
        {
            dict1.TryGetValue(name, out var c1);
            dict2.TryGetValue(name, out var c2);
            var v1 = c1?.ValueInUse ?? c1?.Value;
            var v2 = c2?.ValueInUse ?? c2?.Value;
            return new ConfigDiff
            {
                Name = name,
                Description = c1?.Description ?? c2?.Description,
                Value1 = v1,
                Value2 = v2,
                IsDifferent = v1 != v2
            };
        }).ToList();

        return new ComparisonResult
        {
            Server1 = s1,
            Server2 = s2,
            Diffs = diffs,
            TotalSettings = diffs.Count,
            DifferentCount = diffs.Count(d => d.IsDifferent),
            MatchingCount = diffs.Count(d => !d.IsDifferent)
        };
    }

    private static async Task<ServerProperties> FetchPropertiesAsync(SqlConnection conn)
    {
        var sql = """
            SELECT
                SERVERPROPERTY('ServerName')         AS ServerName,
                SERVERPROPERTY('ProductVersion')     AS ProductVersion,
                SERVERPROPERTY('ProductLevel')       AS ProductLevel,
                SERVERPROPERTY('Edition')            AS Edition,
                SERVERPROPERTY('EngineEdition')      AS EngineEdition,
                SERVERPROPERTY('Collation')          AS Collation,
                SERVERPROPERTY('MachineName')        AS MachineName,
                SERVERPROPERTY('InstanceName')       AS InstanceName,
                SERVERPROPERTY('IsClustered')        AS IsClustered,
                SERVERPROPERTY('IsFullTextInstalled') AS IsFullTextInstalled
            """;

        await using var cmd = new SqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync();

        if (!await reader.ReadAsync()) return new ServerProperties();

        return new ServerProperties
        {
            ServerName = reader["ServerName"]?.ToString(),
            ProductVersion = reader["ProductVersion"]?.ToString(),
            ProductLevel = reader["ProductLevel"]?.ToString(),
            Edition = reader["Edition"]?.ToString(),
            EngineEdition = reader["EngineEdition"]?.ToString(),
            Collation = reader["Collation"]?.ToString(),
            MachineName = reader["MachineName"]?.ToString(),
            InstanceName = reader["InstanceName"]?.ToString(),
            IsClustered = Convert.ToInt32(reader["IsClustered"]) == 1,
            IsFullTextInstalled = Convert.ToInt32(reader["IsFullTextInstalled"]) == 1
        };
    }

    private static async Task<List<ServerConfigItem>> FetchConfigsAsync(SqlConnection conn)
    {
        var sql = """
            SELECT
                name,
                CAST(value AS nvarchar(256))         AS value,
                CAST(value_in_use AS nvarchar(256))  AS value_in_use,
                description,
                CAST(minimum AS nvarchar(256))       AS minimum,
                CAST(maximum AS nvarchar(256))       AS maximum,
                is_dynamic,
                is_advanced
            FROM sys.configurations
            ORDER BY name
            """;

        var items = new List<ServerConfigItem>();
        await using var cmd = new SqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            items.Add(new ServerConfigItem
            {
                Name = reader["name"].ToString()!,
                Value = reader["value"]?.ToString(),
                ValueInUse = reader["value_in_use"]?.ToString(),
                Description = reader["description"]?.ToString(),
                Minimum = reader["minimum"]?.ToString(),
                Maximum = reader["maximum"]?.ToString(),
                IsDynamic = Convert.ToBoolean(reader["is_dynamic"]),
                IsAdvanced = Convert.ToBoolean(reader["is_advanced"])
            });
        }

        return items;
    }

    private static string GetServerLabel(string connectionString)
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        return builder.DataSource ?? connectionString;
    }
}
