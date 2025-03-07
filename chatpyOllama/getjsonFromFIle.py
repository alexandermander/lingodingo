import re
import json

def extract_code_blocks(response):
    code_blocks = []
    matches = re.findall(r'```(\w+)\n(.*?)```', response, re.DOTALL)
    for lang, code in matches:
        code_blocks.append((lang, code))
    return code_blocks


# open a file

with open('otherConvert.txt', 'r', encoding='utf-8') as file:
    response = file.read()

listOfCodeBlocks = extract_code_blocks(response)
for lang, code in listOfCodeBlocks:
    print(f'{code}' + ",", end="")
