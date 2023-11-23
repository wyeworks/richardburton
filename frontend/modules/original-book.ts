import { request } from "app";

type OriginalBook = { title: string; authors: string };

interface OriginalBookModule {
  REMOTE: {
    search(term: string): Promise<OriginalBook[]>;
  };
}

const OriginalBook: OriginalBookModule = {
  REMOTE: {
    search(term) {
      return request(async (http) => {
        const { data } = await http.get<OriginalBook[]>("/original-books", {
          params: { search: term },
        });

        return data;
      });
    },
  },
};

export { OriginalBook };
