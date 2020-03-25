#!/usr/bin/env node

import commander from "commander"
import colors from "colors"
import axios, {AxiosResponse} from "axios"
import path from "path"
const excelToJson = require('convert-excel-to-json');

const result = excelToJson({
    sourceFile: path.resolve('src/data/amap-citycode.xlsx')
});

const command = commander
    .version("1.0.1")
    .option("-c, --city [code]", "Add city code")//, parseInt
    .parse(process.argv)

if (process.argv.slice(2).length === 0) {
    command.outputHelp(colors.red)
    process.exit()
}

interface IWeatherResponse {
    status: string;
    count: string;
    info: string;
    infocode: string;
    lives: ILive[];
}

interface ILive {
    province: string;
    city: string;
    adcode: string;
    weather: string;
    temperature: string;
    winddirection: string;
    windpower: string;
    humidity: string;
    reporttime: string;
}


let resultCity = result["Sheet1"].filter((v:any)=>v.A.indexOf(command.city)!=-1)
if (resultCity.length==0){
    console.log(colors.red("地理位置查询出错"))
    process.exit()
}

const URL = "https://restapi.amap.com/v3/weather/weatherInfo"
const KEY = "cddfaf3ac0401e526e70f68c401beaf3"

async function getWeather(Url:string,Key:string,citycode:string){
   try {
       let res:AxiosResponse<IWeatherResponse> = await  axios.get(`${URL}`, {
           params: {
               Key,
               city: citycode
           }
       })
       const live = res.data.lives[0]
       if (live.reporttime){
           console.log("播报时间：",colors.yellow(live.reporttime))
           console.log("播报地区：",colors.white(`${live.province} ${live.city}`))
           console.log("播报天气：",colors.green(`${live.weather} ${live.temperature} 度`))
           console.log()
       }
   }catch (e) {
       console.log(colors.red("天气服务出现异常"))
   }
}

(async ()=>{

    console.log(colors.red("欢迎进入xyx天气预报,以下为播报内容："))
    console.log()
    for (let i = 0; i < resultCity.length; i++) {
        await getWeather(URL,KEY,resultCity[i].B);
    }
    console.log(colors.red("播报结束，欢应再次使用"))
})();

