export interface ServerProperties {
  serverName: string | null;
  productVersion: string | null;
  productLevel: string | null;
  edition: string | null;
  engineEdition: string | null;
  collation: string | null;
  machineName: string | null;
  instanceName: string | null;
  isClustered: boolean;
  isFullTextInstalled: boolean;
}

export interface ServerSnapshot {
  connectionLabel: string;
  properties: ServerProperties;
  configs: ServerConfigItem[];
}

export interface ServerConfigItem {
  name: string;
  value: string | null;
  valueInUse: string | null;
  description: string | null;
  minimum: string | null;
  maximum: string | null;
  isDynamic: boolean;
  isAdvanced: boolean;
}

export interface ConfigDiff {
  name: string;
  description: string | null;
  value1: string | null;
  value2: string | null;
  isDifferent: boolean;
}

export interface ComparisonResult {
  server1: ServerSnapshot;
  server2: ServerSnapshot;
  diffs: ConfigDiff[];
  totalSettings: number;
  differentCount: number;
  matchingCount: number;
}
