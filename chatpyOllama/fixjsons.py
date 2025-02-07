import os
import json
import requests
import string

def getFjson(file):
    with open(file, "r", encoding="utf-8") as file:
        text = file.read()
    json_text = json.loads(text)
    return json_text


get_json = getFjson("./newtest.json")

host = "http://192.168.1.131:8000/fix"

def postFix(obj):
    try:
        # Send the request with the JSON object called obj:data as the main
        #obj = {"data": obj}
        #print(obj)

        stringOfdata = "chinese: "
        stringOfdata += obj.get("chinese") + "。"

        getBrake = obj.get("breakdown", [])
        print("curenntFix: ", obj.get("chinese"))
        stringOfdata += "\n   breakdown: "
        for i in getBrake:
            #print("   ", "character: ", i.get("character") )j
            stringOfdata +=  "\n      " + i.get("character")   
        print("-----------------")

        print(stringOfdata)
        dataObj = {"data": stringOfdata}
        print(dataObj)

        response = requests.post(host, json=dataObj)
        response.raise_for_status()  # Raises an error for bad responses (4xx, 5xx)

        return  response.json()
    except Exception as e:
        print("Client error:", e)
        return None

abc = set(string.ascii_letters)  # All ASCII letters (A-Z, a-z)

for index, i in enumerate(get_json):
    status = False
    getBreakdown = i.get("breakdown", [])  
    for j in getBreakdown:
        try:
            getChar = j.get("character")  # Get the character safely
            if getChar and any(c in abc for c in getChar) or "*" in getChar:
                print("Special character", getChar)
                break
            splitChar = list(getChar)
            if len(splitChar) > 2:
                retive = postFix(i)
                #print(json.dumps(retive, indent=4))

        except Exception as e:
            print(e)
            continue
