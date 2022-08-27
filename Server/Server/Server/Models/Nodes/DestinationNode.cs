using Newtonsoft.Json;
using Server.Enums;

namespace Server.Models.Nodes;

[JsonObject]
public class DestinationNode : Node
{
    [JsonProperty]
    public string _previousNode;

    [JsonProperty] public string tableName;
    
    public override string Execute(ExecutionType executionType, Dictionary<string, Node?>? nodes)
    {
        return nodes.GetValueOrDefault(_previousNode).Execute(executionType, nodes);
    }

    public override string GetPreviousQueryString(ExecutionType executionType, Dictionary<string, Node?> nodes)
    {
        return nodes.GetValueOrDefault(_previousNode).Execute(executionType, nodes);
    }
}