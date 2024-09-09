import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const validateString = (
  value: unknown,
  maxLength: number
): value is string => {
  if (!value || typeof value !== "string" || value.length > maxLength) {
    return false;
  }

  return true;
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Something went wrong";
  }

  return message;
};

export const yearsBetweenAsWord = (
  year: number,
  cap: boolean = true
): string => {
  const currentYear = new Date().getFullYear();
  const yearsDifference = currentYear - year;

  const numberToWord = (num: number): string => {
    const words = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
      "twenty",
    ];
    return num >= 0 && num <= 20
      ? cap === true
        ? capitalize(words[num])
        : words[num]
      : num.toString();
  };
  return numberToWord(yearsDifference);
};

const capitalize = (word: string): string => {
  return word[0].toUpperCase() + word.slice(1);
};

export function formatDate(dateString: string | Date) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "NZ",
  });
}

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(...inputs));
