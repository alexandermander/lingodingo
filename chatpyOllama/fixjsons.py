import os
import json
import requests
import string
import getApiForTrans as pinTrans

def getFjson(file):
    with open(file, "r", encoding="utf-8") as file:
        text = file.read()
    json_text = json.loads(text)
    return json_text


host = "http://192.168.1.131:8000/fix"

def postFix(obj):
    try:
        dataObj = {"data": obj.get("chinese") + "。"}
        print(dataObj["data"])
        listOfData = ""
        getPinyin, trans = pinTrans.getTranAndPinyin(dataObj["data"])
        listOfData += obj.get("chinese") + "|" + getPinyin + "|" + trans

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


get_json = getFjson("./jsons/cosoon.json")
linesOfJson = []

for index, i in enumerate(get_json):
    getBreakdown = i.get("breakdown", [])  
    for j in getBreakdown:
        try:
            getChar = j.get("character")  # Get the character safely
            if getChar and any(c in abc for c in getChar) or "*" in getChar:
                print("Special character", getChar)
                break
            splitChar = list(getChar)
            if len(splitChar) > 2:
                trys = 0
                retive = postFix(i)
                while retive == None and trys < 3:
                    retive = postFix(i)
                    trys += 1
                if retive != None:
                    linesOfJson.append(retive)
                break
        except Exception as e:
            print(e)
            continue

saveTheFileInJsonFormat("cosoon.json", linesOfJson)
