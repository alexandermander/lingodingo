import re
# how to request a page
import requests
#add loading bar for the for loop
from tqdm import tqdm
import json
import os


#for i in range(len(text)):
#    print(text[i])
    #    if "说" in text[i]:
    #    currnetLine = text[i]
    #    j = i 
    #    while True:
    #        j += 1
    #        print(text[j])
    #        if '"' in text[j]:
    #            currnetLine += text[j].split('"')[0] + '"'
    #            text[i] = currnetLine
    #            break
    #        else:
    #            currnetLine += text[j]


#for i in range(len(text)):
#    url = host + text[i]
#    print(url)
#    response = requests.get(url)
#    lines.append(response.text)
#    print(response.text)





host = "http://192.168.1.131:8000/process?input_data="

def getFijson(file, name):
    print(f"Processing {name}...")
    lines = []

    with open(file, "r", encoding="utf-8") as file:
        text = file.read()

    print(text)

    text = text.replace("\n", "")
    text =re.split(r"。|，|（|与|、|和", text)

    for i in tqdm(range(len(text))):
        url = host + text[i]
        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Error fetching {url}: {response.status_code}")
                continue
            json_response = json.loads(response.text)
            lines.append(json_response)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            continue

    saveTheFileInJsonFormat(name, lines)

def getFilesInFolder():
    path = "./files"
    files = [f"{path}/{file}" for file in os.listdir(path)]
    for file in files:
        getFijson(file, file.split("/")[-1])

def saveTheFileInJsonFormat(name, lines):
    path = "./jsons"
    name = name.split(".")[0]

    with open(f"{path}/{name}.json", "w", encoding="utf-8") as file:
        json.dump(lines, file, ensure_ascii=False)
    print(f"File {path}/{name}.json has been saved")

if __name__ == "__main__":
    getFilesInFolder()
    print("All files have been processed")


