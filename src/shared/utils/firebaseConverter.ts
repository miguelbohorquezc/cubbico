import { Timestamp } from "firebase/firestore";

export const convertTimestamps = (data: any) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value instanceof Timestamp) {
        acc[key] = value.toDate();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
  };