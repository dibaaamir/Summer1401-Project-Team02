using System.Data;
using System.Drawing.Printing;
using System.Text;
using Microsoft.VisualBasic;
using Server.Controllers;
using Server.ExtensionMethods;
using Server.Models;
using Server.Models.Database;
using Server.Models.Parsers;

namespace Server.Services;

public class DataInventoryService :  IDataInventoryService
{
    private readonly IDatabase _database;
    
    public DataInventoryService(IDatabase database)
    {
        _database = database;
    }
    public string UploadFile(IFormFile? file)
    {
        var parser = MapToParser(file!.ContentType);
        var dataTable = parser.ParseToDataTable(file.ReadAll().ToString());
        string id = MyExtensionMethods.CreateId();
        var tableInfo = new TableInfo(id, file.FileName, DateTime.Now);
        _database.CreateTable(dataTable, id);
        _database.ImportDataTable(dataTable, id);
        _database.addToAllTablesInventory(tableInfo);
        return $"{{ \"tableId\" : \"{id}\" }}";
    }


    public string AddDestination(string name)
    {
        string id = MyExtensionMethods.CreateId();
        var tableInfo = new TableInfo(id, name, DateTime.Now);
        _database.CreateTable(id);
        _database.addToAllTablesInventory(tableInfo);
        return $"{{ \"tableId\" : \"{id}\" }}";
    }

    private IParser MapToParser(string fileType)
    {
        switch (fileType)
        {
            case "text/csv": return new CsvParser();
            case "csv": return new CsvParser();
            case "application/json": return new JsonParser();
            case "json": return new JsonParser();
            default: throw new Exception("not supported file format");
        }
    }

        
    public MemoryStream Download(string tableId, string format)
    {
        var dataTable = _database.GetTable(tableId);
        var parser = MapToParser(format);
        var csvString = parser.ParseFromDataTable(dataTable);
        return new MemoryStream(Encoding.ASCII.GetBytes(csvString));
    }

    public List<TableInfo> GetAllTables()
    {
        var dataTable = _database.GetTable(Config.dataInventoryTableName);
        var tablesList = (from row in dataTable.AsEnumerable()
            select new TableInfo(Convert.ToString(row["id"]),Convert.ToString(row["tableName"]), Convert.ToDateTime(row["dateAndTime"]))).ToList();
        return tablesList;
    }

    public string deleteDataset(string tableId)
    {
        _database.deleteDataset(tableId);
        return $"{{ \"deleted table id\" : \"{tableId}\" }}";
    }
}