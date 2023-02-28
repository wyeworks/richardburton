import {
  FloatingFocusManager,
  FloatingPortal,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { cloneElement, FC, ReactElement, useRef, useState } from "react";
import Menu from "./Menu";
import MenuItem from "./MenuItem";

type Props = {
  children: ReactElement;
  options: string[];
  isOpen: boolean;
  activeIndex: number | null;
  setIsOpen: (value: boolean) => void;
  setActiveIndex: (value: number | null) => void;
  onSelect: (option: string) => void;
};

const MenuProvider: FC<Props> = ({
  children,
  options,
  isOpen,
  activeIndex,
  setIsOpen,
  setActiveIndex,
  onSelect,
}) => {
  const listRef = useRef<(HTMLLIElement | null)[]>([]);

  const { x, y, strategy, refs, context } = useFloating<HTMLDivElement>({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 10,
      }),
    ],
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [
      useRole(context, { role: "listbox" }),
      useDismiss(context),
      useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
      }),
    ]
  );

  return (
    <>
      {cloneElement(
        children,
        getReferenceProps({
          ref: refs.setReference,
          ...children.props,
        })
      )}
      <FloatingPortal>
        {isOpen && (
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <Menu
              ref={refs.setFloating}
              {...getFloatingProps({
                style: {
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                },
              })}
            >
              {options.map((option, index) => (
                <MenuItem
                  key={option}
                  ref={(node) => (listRef.current[index] = node)}
                  selected={activeIndex === index}
                  {...getItemProps({
                    onClick: () => {
                      setIsOpen(false);
                      onSelect(option);
                    },
                  })}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
};

export default MenuProvider;
