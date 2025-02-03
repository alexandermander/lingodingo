import re
# how to request a page
import requests
#add loading bar for the for loop
from tqdm import tqdm
import json


with open("textToConvert.txt", "r", encoding="utf-8") as file:
    text = file.read()

print(text)
text = text.replace("\n", "")

text =re.split(r"。|，|（|与|、", text)


count = 0
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


host = "http://192.168.1.131:8000/process?input_data="
#for i in range(len(text)):
#    url = host + text[i]
#    print(url)
#    response = requests.get(url)
#    lines.append(response.text)
#    print(response.text)
lines = []

for i in tqdm(range(len(text))):
    if i == 3:
        break
    url = host + text[i]
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx and 5xx)
        json_response = json.loads(response.text)
        #chck taht ise response:
#                "breakdown": [
#            {
#                "character": "一只",
#                "pinyin": "yī zhǐ",
#                "meaning": "A (一 = one, 只 = only)"

        if "breakdown" in json_response:
            for breakdown in json_response["breakdown"]:
                if "character" in breakdown:
                    print(breakdown["character"])
                if "pinyin" in breakdown:
                    print(breakdown["pinyin"])
                if "meaning" in breakdown:
                    print(breakdown["meaning"])

        lines.append(json_response)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")

# Writing the collected lines to a JSON file
with open("output.json", "w", encoding="utf-8") as file:
    json.dump(lines, file, ensure_ascii=False, indent=4)

print("Data has been written to output.json")




















