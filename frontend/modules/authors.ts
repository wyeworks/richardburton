import { request } from "app";

type Author = string;

interface AuthorModule {
  REMOTE: {
    search(term: string): Promise<Author[]>;
  };
}

const Author: AuthorModule = {
  REMOTE: {
    search(term) {
      return request(async (http) => {
        const { data } = await http.get<Author[]>("/authors", {
          params: { search: term },
        });

        return data;
      });
    },
  },
};

export { Author };
