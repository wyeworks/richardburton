import { FC } from "react";
import Button from "./Button";
import { Counter } from "./Counter";
import { LearnMoreModal } from "./LearnMoreModal";
import { useURLQueryModal } from "./Modal";
import Tooltip from "./Tooltip";

interface Props {
  count: number | null;
}

const IndexCounter: FC<Props> = ({ count }) => {
  const modal = useURLQueryModal("learn-more");

  return (
    <>
      {count && (
        <Tooltip info message="Learn more">
          <Button
            label="publications registered so far"
            aria-label={`${count} publications registered so far`}
            onClick={() => modal.open()}
            Icon={<Counter value={count} />}
            width="fit"
          />
        </Tooltip>
      )}
      <LearnMoreModal isOpen={modal.isOpen} onClose={modal.close} />
    </>
  );
};

export { IndexCounter };
