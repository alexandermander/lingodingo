import ollama
import json

# Open the JSON file with explicit UTF-8 encoding
with open('charwnatedout.json', 'r', encoding='utf-8') as f:
    prompt_data = f.read()



promt = f"""
this is some data form lvl for a game: called: firstLernvlvl-1.json

greante a new setence for me in the same format but with a new setence 

make them in the same lvl of complexity like short sentences and easy caracters


file: firstLernvlvl-1.json:
{prompt_data}


'''
rember to previce the file in a json format -> IMPORTANT
and previde 10 new sentences in that format
"""



new_promt = f"""
I want to lern chinese, so helo me with some sentences in chinese
here is one sentence in chinese:


herer is an example of a sentence in chinese and the json format:
{prompt_data}

break it down for me each character and its meaning
if multiple characters combine to form a word use only taht 
give me a json obj with the brake down of the sentence

the sentence you need to help me with is:  我昨天看了一部电影。

NOTE: Remember to answer in the same format as the prompt and answer in English please
"""

client = ollama.Client()
response = client.generate(model="deepseek-r1:8b", prompt=new_promt)

print("Model's Response:")
print(response['response'])  # Use 'response' instead of 'output' (check Ollama docs)


