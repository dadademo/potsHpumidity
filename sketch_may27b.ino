
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
// 读取温度
#define PIN_AO A0  //土壤传感器AO接ESP8266引脚A0
//#define PIN_DO 4  //湿度高于设定值时，DO输出高电平，模块提示灯亮

int M0 = 1024;  //在空气中AO读取的值最大为1024，代表干燥时的读数
int M1 = 164;   //浸泡在水里的最小值 464（最小值会改变），代表100%湿度

float i=0;
float j=0;

#define SERVER_IP "http://192.168.0.111:3001/sendCurrentTemp"

const char* name = "123";               //这里改成你的设备当前环境下要连接的接入点名字
const char* password = "123123";  //这里改成你的设备当前环境下要连接的接入点密码
// 上报时间间隔
int outTime = 1000 * 60 * 5;
// int outTime = 1000 * 60;
void setup() {
  // 设置引脚
  pinMode(PIN_AO, INPUT);

  Serial.begin(115200);  // 启动串口通讯，波特率设置为115200

  Serial.println("未连接");


  Serial.println("开始连接");

  WiFi.begin(name, password);
  Serial.print("正在连接到");
  Serial.print(name);

  while (WiFi.status() != WL_CONNECTED)  //判定网络状态
  {
    delay(500);

    Serial.print("网络连接成功");

    Serial.print("连接到的接入点名字:");

    Serial.println(name);  // 告知用户建立的接入点WiFi名

    Serial.print("连接到的接入点密码:");

    Serial.println(password);  // 显示用户建立的接入点WiFi密码

    Serial.print("无线模式成功开启，网络连接成功");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("无线IP地址为: ");
    Serial.println(WiFi.localIP());
  }
}

void loop() {
  // put your main code here, to run repeatedly:

  if (WiFi.status() == WL_CONNECTED) {
    http_post();
    WiFi.forceSleepBegin();  // Wifi Off
    delay(outTime);
    WiFi.forceSleepWake();  // Wifi On
  }
}



void http_post() {

  //创建 WiFiClient 实例化对象
  WiFiClient client;

  //创建http对象
  HTTPClient http;

  //配置请求地址
  http.begin(client, SERVER_IP);  //HTTP请求
  Serial.print("[HTTP] begin...\n");
  // 长度
  DynamicJsonDocument doc(96);

  float data = analogRead(PIN_AO);
  Serial.println(data);
  i = data / 1023;
  j = (1 - i) * 100;

  Serial.println(j);

  // 写入当前温度值
  doc["temp"] = j;
  String output;
  serializeJson(doc, output);

  //启动连接并发送HTTP报头和报文
  int httpCode = http.POST(output);
  Serial.print("[HTTP] POST...\n");

  //连接失败时 httpCode时为负
  if (httpCode > 0) {
    //将服务器响应头打印到串口
    Serial.printf("[HTTP] POST... code: %d\n", httpCode);

    //将从服务器获取的数据打印到串口
    if (httpCode == HTTP_CODE_OK) {
      const String& payload = http.getString();
      Serial.println("received payload:\n<<");
      Serial.println(payload);
      Serial.println(">>");
    }
  } else {
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }
  //关闭http连接
  http.end();
}
