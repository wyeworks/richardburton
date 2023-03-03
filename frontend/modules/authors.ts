import { request } from "app";

type Author = { name: string };

interface AuthorModule {
  REMOTE: {
    search(term: string): Promise<Author[]>;
  };
}

const Author: AuthorModule = {
  REMOTE: {
    search(term) {
      return request(async (http) => {
        const { data } = await http.get("/authors", {
          params: { search: term },
        });
        return data;
      });
    },
  },
};

export { Author };
