import { mergeRefs } from "react-merge-refs";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import type { Placement } from "@floating-ui/react";
import { cloneElement, FC, ReactElement, useMemo, useState } from "react";

// Adapted from https://floating-ui.com/docs/tooltip

type TooltipOptions = {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  followCursor?: true | "x" | "y";
};

function useTooltip(options: TooltipOptions = {}) {
  const {
    initialOpen = false,
    placement = "top",
    open: controlledOpen,
    onOpenChange: setControlledOpen,
  } = options;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), flip(), shift()],
  });

  const context = data.context;

  const interactions = useInteractions([
    useHover(context, { move: false, enabled: controlledOpen == null }),
    useFocus(context, { enabled: controlledOpen == null }),
    useDismiss(context),
    useRole(context, { role: "tooltip" }),
  ]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data]
  );
}

type Props = {
  children: ReactElement;
  content: ReactElement;
} & TooltipOptions;

const Tooltip: FC<Props> = ({ children, content, ...options }) => {
  const { followCursor = false } = options;
  const followCursorX = [true, "x"].includes(followCursor);
  const followCursorY = [true, "y"].includes(followCursor);

  const state = useTooltip(options);

  const childrenRef = (children as any).ref;
  const ref = useMemo(
    () => mergeRefs([state.reference, childrenRef]),
    [state.reference, childrenRef]
  );

  return (
    <>
      {cloneElement(
        children,
        state.getReferenceProps({
          ref,
          onMouseMove({ clientX, clientY, target: eventTarget }) {
            if (followCursor) {
              const target = eventTarget as HTMLElement;
              const { width, height, x, left, right, y, top, bottom } =
                target.getBoundingClientRect();

              const horizontalProperties = followCursorX
                ? { width: 0, x: clientX, left: clientX, right: clientX }
                : { width, x, left, right };

              const verticalProperties = followCursorY
                ? { height: 0, y: clientY, top: clientY, bottom: clientY }
                : { height, y, top, bottom };

              ref({
                getBoundingClientRect() {
                  return {
                    ...horizontalProperties,
                    ...verticalProperties,
                  };
                },
              });
            }
          },
          ...children.props,
          "data-state": state.open ? "open" : "closed",
        })
      )}
      <FloatingPortal>
        {state.open && (
          <div
            ref={state.floating}
            style={{
              position: state.strategy,
              top: state.y ?? 0,
              left: state.x ?? 0,
              visibility: state.x == null ? "hidden" : "visible",
            }}
            {...state.getFloatingProps()}
          >
            {content}
          </div>
        )}
      </FloatingPortal>
    </>
  );
};

export default Tooltip;
