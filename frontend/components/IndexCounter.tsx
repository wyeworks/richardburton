import { FC } from "react";
import Button from "./Button";
import { Counter } from "./Counter";
import { LEARN_MORE_MODAL_KEY } from "./LearnMoreModal";
import { useURLQueryModal } from "./Modal";
import Tooltip from "./Tooltip";

interface Props {
  count: number | null;
}

const IndexCounter: FC<Props> = ({ count }) => {
  const modal = useURLQueryModal(LEARN_MORE_MODAL_KEY);

  return (
    count && (
      <Tooltip info message="Learn more">
        <div className="w-full sm:w-auto">
          <Button
            label="publications registered so far"
            aria-label={`${count} publications registered so far`}
            onClick={() => modal.open()}
            Icon={<Counter value={count} />}
            width="full"
          />
        </div>
      </Tooltip>
    )
  );
};

export { IndexCounter };
