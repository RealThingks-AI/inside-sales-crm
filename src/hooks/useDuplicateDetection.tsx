import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DuplicateResult {
  id: string;
  name: string;
  email?: string;
  matchType: "exact" | "similar";
}

interface UseDuplicateDetectionOptions {
  table: "leads" | "contacts" | "accounts";
  nameField: string;
  emailField?: string;
}

export const useDuplicateDetection = ({
  table,
  nameField,
  emailField = "email",
}: UseDuplicateDetectionOptions) => {
  const [duplicates, setDuplicates] = useState<DuplicateResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkDuplicates = useCallback(
    async (name: string, email?: string) => {
      if (!name || name.length < 2) {
        setDuplicates([]);
        return [];
      }

      setIsChecking(true);
      try {
        const results: DuplicateResult[] = [];

        // Check for exact email match first (most reliable)
        if (email && email.includes("@")) {
          const { data: emailMatches } = await supabase
            .from(table)
            .select(`id, ${nameField}, ${emailField}`)
            .ilike(emailField, email)
            .limit(5);

          if (emailMatches) {
            emailMatches.forEach((match: any) => {
              results.push({
                id: match.id,
                name: match[nameField],
                email: match[emailField],
                matchType: "exact",
              });
            });
          }
        }

        // Check for similar names (if no email match)
        if (results.length === 0 && name.length >= 3) {
          const nameParts = name.toLowerCase().split(" ").filter(Boolean);
          const searchPattern = `%${nameParts[0]}%`;

          const { data: nameMatches } = await supabase
            .from(table)
            .select(`id, ${nameField}, ${emailField}`)
            .ilike(nameField, searchPattern)
            .limit(5);

          if (nameMatches) {
            nameMatches.forEach((match: any) => {
              const matchName = (match[nameField] || "").toLowerCase();
              const inputName = name.toLowerCase();

              // Check if names are similar (basic fuzzy matching)
              const isSimilar =
                matchName.includes(inputName) ||
                inputName.includes(matchName) ||
                levenshteinDistance(matchName, inputName) <= 3;

              if (isSimilar) {
                results.push({
                  id: match.id,
                  name: match[nameField],
                  email: match[emailField],
                  matchType: "similar",
                });
              }
            });
          }
        }

        setDuplicates(results);
        return results;
      } catch (error) {
        console.error("Duplicate check failed:", error);
        setDuplicates([]);
        return [];
      } finally {
        setIsChecking(false);
      }
    },
    [table, nameField, emailField]
  );

  const clearDuplicates = useCallback(() => {
    setDuplicates([]);
  }, []);

  return {
    duplicates,
    isChecking,
    checkDuplicates,
    clearDuplicates,
  };
};

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
