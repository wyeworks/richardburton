import { request } from "app";

type Publisher = string;

interface PublisherModule {
  REMOTE: {
    search(term: string): Promise<Publisher[]>;
  };
}

const Publisher: PublisherModule = {
  REMOTE: {
    search(term) {
      return request(async (http) => {
        const { data } = await http.get<Publisher[]>("/publishers", {
          params: { search: term },
        });

        return data;
      });
    },
  },
};

export { Publisher };
