import requests
import json


url = "https://api-cdn.dioco.io/base_dict_fullDictTranslate_2"
headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,q=0.8,;q=0.7,en-GB;q=0.6",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "Referer": "https://www.languagereactor.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
}

def getTranAndPinyin(text):
    data = {
        "input": {
            "type": "TEXT",
            "text": text
        },
        "sl": "zh-CN",
        "tl": "en",
        "mode": "AUTO_DETECT"
    }

    response = requests.post(url, headers=headers, json=data)

# get the data extracted from the response
    response_data = response.json()
    lenOfRes = len(response_data['data']['nlp'][0])

    transLation = response_data['data']['mTranslations'][0]


#{'pinyin': ['měi', 'tiān'], 'text': '每天', 'tones': [3, 1]}
#{'pinyin': ['zǎo', 'shàng'], 'text': '早上', 'tones': [3, 4]}

    listOftext = []
    for i in range(lenOfRes):
        joied = ''.join(response_data['data']['nlp'][0][i]['form']['pinyin'])
        listOftext.append(joied)

    newJoined = ' '.join(listOftext)

    return newJoined, transLation
