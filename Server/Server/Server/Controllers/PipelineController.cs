using System.Data;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Server.Models;
using Server.Models.Parsers;
using Server.Services;

namespace Server.Controllers;

[ApiController]
[Route("[controller]/[Action]")]
public class PipelineController : Controller
{
    private readonly IPipelineService _pipelineService;
    private readonly ILogger<IPipelineService> _logger;

    public PipelineController(IPipelineService pipelineService, ILogger<IPipelineService> logger)
    {
        _pipelineService = pipelineService;
        _logger = logger;
    }

    [HttpPost]
    public IActionResult Execute([FromBody] string pipelineJson)
    {
        _logger.LogInformation(TempUtils.GeneratePipelineJson());
        //  "{\"Nodes\":{\"source\":{\"_tableName\":\"dataset_csv\",\"Id\":\"source\",\"_NodeType\":1},\"dest\":{\"_previousNode\":\"custom\",\"tableName\":\"output1\",\"Id\":\"dest\",\"_NodeType\":0},\"custom\":{\"first\":\"[short bio]\",\"second\":\" \",\"_previousNode\":\"source\",\"Id\":\"custom\",\"_NodeType\":3}}}\n"
        try
        { 
            return Ok(_pipelineService.Execute(CustomPipelineDeserializer.Deserialize(pipelineJson)));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    
    [HttpGet]
    public IActionResult GetHeading(string pipelineJson, string id)
    {
        // {"Nodes":{"source":{"Data":"{ \"tableName\": \"dataset_csv\"}","Id":"source","_NodeType":1},"dest":{"Data":"{ \"tableName\" : \"output2\" , \"previousNode\" : \"selector\"}","Id":"dest","_NodeType":0},"selector":{"_previousNodesIds":null,"Data":"{ \"columns\": [\"first_name\", \"id\" ], \"previousNode\" : \"source\" }","Id":"selector","_NodeType":2}}}
        try
        {
            var dataTable = _pipelineService.GetHeading(CustomPipelineDeserializer.Deserialize(pipelineJson), id);
            return Ok(dataTable.Columns
                .Cast<DataColumn>()
                .Select(x => x.ColumnName)
                .ToList());
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost]
    public IActionResult Preview(string jsonString, string id)
    {
        try
        {
            var jsonSerializerSettings = new JsonSerializerSettings();
            jsonSerializerSettings.Converters.Add(new CustomPipelineDeserializer());
            jsonSerializerSettings.TypeNameHandling = TypeNameHandling.Auto;

            var dataTable = _pipelineService.Preview(JsonConvert.DeserializeObject<Pipeline>(jsonString, jsonSerializerSettings)!, id);
            return Ok(dataTable);
        }
        catch (Exception e)
        {
            
            return BadRequest(e.Message);
        }
    }

}


