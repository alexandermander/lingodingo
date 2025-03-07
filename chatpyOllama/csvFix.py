import os
import json
import requests
import string
import getApiForTrans as pinTrans

def getFile(file):
    with open(file, 'r', encoding='utf-8') as f:
        raw_data = f.read()
        raw_data = raw_data.split("\n")
        return raw_data


def getFjson(file):
    with open(file, "r", encoding="utf-8") as file:
        text = file.read()
    json_text = json.loads(text)
    return json_text



host = "http://192.168.1.131:8000/fix"

def postFix(obj):
    try:
        dataObj = {"data": obj}
        print(dataObj["data"])
        listOfData = ""
        getPinyin, trans = pinTrans.getTranAndPinyin(dataObj["data"])
        listOfData += dataObj["data"] + "|" + getPinyin + "|" + trans

        newData = {"data": listOfData}
        print(newData)

        response = requests.post(host, json=newData)
        response.raise_for_status()

        return  response.json()
    except Exception as e:
        print("Client error:", e)
        return None

abc = set(string.ascii_letters)  # All ASCII letters (A-Z, a-z)

def saveTheFileInJsonFormat(name, lines):
    folder = "./jsons"
    if not os.path.exists(folder):
        os.makedirs(folder)
    print("open file", f"{folder}/{name}")
    with open(f"{folder}/{name}", "w", encoding="utf-8") as file:
        json.dump(lines, file, ensure_ascii=False, indent=4)

ccsv_data = getFile("./thisWilwrok.txt")
print(ccsv_data)

linesOfJson = []

getJsonObj = getFjson("./newjsons/tvshowJsofirstback.json")

for i in getJsonObj:
    linesOfJson.append(i)

onlyChinese = {j["chinese"] for j in getJsonObj}

print(len(onlyChinese))

for index, i in enumerate(ccsv_data):
    if i not in onlyChinese:
        trys = 0
        retive = postFix(i)
        while retive == None and trys < 3:
            retive = postFix(i)
            trys += 1
        if retive != None:
            linesOfJson.append(retive)

#take all the jsons from the file and add them to the list

saveTheFileInJsonFormat("tvshow.json", linesOfJson)

#for index, i in enumerate(ccsv_data):
#    trys = 0
#    retive = postFix(i)
#    while retive == None and trys < 3:
#        retive = postFix(i)
#        trys += 1
#    if retive != None:
#        linesOfJson.append(retive)
#

