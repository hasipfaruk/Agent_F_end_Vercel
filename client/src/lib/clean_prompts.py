import json

input_path = "D:/Digital/Agent_F_end_Vercel-main/client/src/lib/Prompts.json"
output_path = "D:/Digital/Agent_F_end_Vercel-main/client/src/lib/Prompts_clean.json"

with open(input_path, "r", encoding="utf-8", errors="replace") as infile:
    data = json.load(infile)

with open(output_path, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, ensure_ascii=False, indent=2)

print(f"Cleaned JSON saved to {output_path}")