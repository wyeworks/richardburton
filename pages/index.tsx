import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="p-8 mx-auto max-w-7xl">
      <header className="space-y-2 text-center">
        <h1 className="text-5xl">Richard Burton Platform</h1>
        <h2 className="text-2xl">
          A database about Brazilian literature in translation
        </h2>
      </header>
    </div>
  );
};

export default Home;
