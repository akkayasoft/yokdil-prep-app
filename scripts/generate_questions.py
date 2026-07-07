import os
import json
from google import genai
from google.genai import types

# KULLANIM:
# 1. 'google-genai' paketini kurun: pip install google-genai
# 2. GEMINI_API_KEY çevre değişkenini ayarlayın (export GEMINI_API_KEY="sizin_anahtariniz")
# 3. Betiği çalıştırın: python scripts/generate_questions.py

def generate_yokdil_questions(count=5):
    # API anahtarını çevre değişkeninden alır
    client = genai.Client()
    
    prompt = f"""
    YÖKDİL Fen Bilimleri sınavı formatında {count} adet soru üret.
    Sorular şu tiplerden karma olmalıdır:
    - Kelime Bilgisi (Vocabulary)
    - Çeviri (İngilizce-Türkçe veya Türkçe-İngilizce)
    - Paragraf Tamamlama (Paragraph Completion)
    - Anlamı Bozan Cümle (Irrelevant Sentence)
    
    Lütfen yanıtı JSON formatında, aşağıdaki şemaya tam olarak uyacak bir liste (array) olarak döndür. Markdown etiketleri kullanmadan doğrudan geçerli bir JSON döndür.
    Örnek JSON Objesi Formatı:
    [
      {{
        "id": "rastgele_benzersiz_bir_sayi_veya_string",
        "type": "Kelime Bilgisi",
        "context": "Varsa okuma parçası veya ön bilgi (yoksa boş bırak veya null)",
        "text": "Soru metni veya cümlesi. Boşluklar için ---- kullan.",
        "options": [
          {{"id": "A", "text": "Seçenek 1"}},
          {{"id": "B", "text": "Seçenek 2"}},
          {{"id": "C", "text": "Seçenek 3"}},
          {{"id": "D", "text": "Seçenek 4"}},
          {{"id": "E", "text": "Seçenek 5"}}
        ],
        "correctOption": "C",
        "explanation": "Bu seçeneğin neden doğru olduğuna dair detaylı Türkçe açıklama."
      }}
    ]
    """

    print("Gemini API'ye istek gönderiliyor, sorular üretiliyor...")
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    
    try:
        new_questions = json.loads(response.text)
        return new_questions
    except Exception as e:
        print("JSON parse hatası:", e)
        print("Dönen metin:", response.text)
        return []

def main():
    questions_file_path = "src/data/questions.json"
    
    # Mevcut soruları oku
    existing_questions = []
    if os.path.exists(questions_file_path):
        with open(questions_file_path, "r", encoding="utf-8") as f:
            try:
                existing_questions = json.load(f)
            except json.JSONDecodeError:
                existing_questions = []
                
    print(f"Mevcut soru sayısı: {len(existing_questions)}")
    
    # Yeni sorular üret
    new_questions = generate_yokdil_questions(count=10) # Tek seferde 10 soru (Token limitleri için)
    
    if new_questions:
        # ID'leri düzenle
        start_id = max([int(q.get("id", 0)) for q in existing_questions] + [0]) + 1
        for i, q in enumerate(new_questions):
            q["id"] = start_id + i
            
        existing_questions.extend(new_questions)
        
        # Dosyaya geri yaz
        with open(questions_file_path, "w", encoding="utf-8") as f:
            json.dump(existing_questions, f, ensure_ascii=False, indent=2)
            
        print(f"Başarıyla {len(new_questions)} yeni soru eklendi!")
        print(f"Toplam soru sayısı: {len(existing_questions)}")
    else:
        print("Soru üretilemedi.")

if __name__ == "__main__":
    main()
