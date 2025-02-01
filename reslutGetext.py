import re
import json

text_ex = """
```json
{
  "chinese": "ä½ æ˜¯æˆ‘çš„æœ‹å‹ã€‚",
  "pinyin": "NÇ shÃ¬ wÇ’ de yÃ³u qÃ­ã€‚",
  "translation": "You are my friend.",
  "breakdown": [
    {
      "character": "ä½ ",
      "pinyin": "nÇ",
      "meaning": "you (used for someone you're talking to)"
    },
    {
      "character": "æ˜¯",
      "pinyin": "shÃ¬",
      "meaning": "is/are (copular verb)"
    },
    {
      "character": "æˆ‘çš„",
      "pinyin": "wÇ’ de",
      "meaning": "my (æˆ‘ = I/me, çš„ = possessive marker)"
    },
    {
      "character": "æœ‹å‹",
      "pinyin": "yÃ³u qÃ­",
      "meaning": "friend ([P] = friend, [Q] = my)"
    }
  ]
}
```
"""

def extract_code_blocks(response):
    code_blocks = []
    matches = re.findall(r'```(\w+)\n(.*?)```', response, re.DOTALL)

    for lang, code in matches:
        code_blocks.append((lang, code))

    return code_blocks

restlut = extract_code_blocks(text_ex)

# get onnly the json block
print(restlut[0][1])
