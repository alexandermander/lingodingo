from openai import OpenAI
client = OpenAI(api_key="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")

moderation = client.moderations.create(input="I want to kill them.")
print(moderation)

