import React, { useEffect, useState } from "react";
import LevelZero from "../lvlZero/lvlZero";
import { Sentence } from "../SentenceBreakdown";

export default function Train() {
  const [sentences, setSentences] = useState<Sentence[]>([]);

  useEffect(() => {
    const fetchSentences = async () => {
      try {
        const response = await fetch("/firstlvl.json");
        const data = await response.json();

        data.sort(() => Math.random() - 0.5);
        // Get the first 3 sentences
        const fetchedSentences = data.slice(0, 3);
        setSentences(fetchedSentences);
      } catch (error) {
        console.error("Error fetching sentences:", error);
      }
    };

    fetchSentences();
  }, []); 

    if (sentences.length === 0) { 
        return <div>Loading...</div>
    }


return (
    <div>
    <LevelZero currentSentence={sentences} />
    </div>
    )

}
