using System.Data;
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
        
        var tableInfo = new TableInfo(file.Hash(), DateTime.Now);
        _database.CreateTable(dataTable, tableInfo, true);
        _database.ImportDataTable(dataTable, file.Hash());
        return $"{{ \"tableName\" : \"{file.Hash()}\" }}";
    }


    public string AddDestination(string name)
    {
        var tableInfo = new TableInfo(name, DateTime.Now);
        _database.CreateTable(tableInfo);
        return $"{{ \"tableName\" : \"{name}\" }}";
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

        
    public MemoryStream Download(string tableName, string format)
    {
        var dataTable = _database.GetTable(tableName);
        var parser = MapToParser(format);
        var csvString = parser.ParseFromDataTable(dataTable);
        return new MemoryStream(Encoding.ASCII.GetBytes(csvString));
    }

    public List<TableInfo> GetAllTables()
    {
        var dataTable = _database.GetTable(Config.dataInventoryTableName);
        var tablesList = (from row in dataTable.AsEnumerable()
            select new TableInfo(Convert.ToString(row["tableName"]), Convert.ToDateTime(row["dateAndTime"]))).ToList();
        // foreach (var tableInfo in tablesList)
        // {
        //     Console.WriteLine(tableInfo._tableName);
        // }
        return tablesList;
        // var parser = MapToParser("csv");
        // var csvString = parser.ParseFromDataTable(dataTable);
        // return new MemoryStream(Encoding.ASCII.GetBytes(csvString));
    }
}