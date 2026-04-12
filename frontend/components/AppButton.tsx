import React from "react";
import { Pressable, Text, useColorModeValue, IPressableProps } from "native-base";

type AppButtonProps = IPressableProps & {
  label: string;
  variant?: "solid" | "outline";
  isDisabled?: boolean;
};

const AppButton: React.FC<AppButtonProps> = ({
  label,
  variant = "solid",
  isDisabled,
  ...props
}) => {
  const solidBg = useColorModeValue("blue.600", "blue.600");
  const solidPressedBg = useColorModeValue("blue.700", "blue.700");
  const solidDisabledBg = useColorModeValue("gray.300", "gray.700");
  const outlineBorder = useColorModeValue("gray.400", "gray.500");
  const outlinePressedBg = useColorModeValue("gray.100", "gray.700");
  const outlineTextColor = useColorModeValue("gray.800", "gray.100");
  const solidTextColor = useColorModeValue("white", "white");
  const outlineDisabledTextColor = useColorModeValue("gray.500", "gray.500");

  const variantStyle =
    variant === "solid"
      ? {
          bg: solidBg,
          _pressed: { bg: solidPressedBg },
          _disabled: { bg: solidDisabledBg },
          borderColor: "transparent",
        }
      : {
          bg: "transparent",
          borderWidth: 1,
          borderColor: outlineBorder,
          _pressed: { bg: outlinePressedBg },
          _disabled: { borderColor: outlineBorder },
        };

  const textColor =
    variant === "solid"
      ? solidTextColor
      : isDisabled
      ? outlineDisabledTextColor
      : outlineTextColor;

  return (
    <Pressable
      px={4}
      py={3}
      borderRadius="md"
      alignItems="center"
      justifyContent="center"
      isDisabled={isDisabled}
      opacity={isDisabled ? 0.6 : 1}
      {...variantStyle}
      {...props}
    >
      <Text fontWeight="semibold" color={textColor} bg="transparent">
        {label}
      </Text>
    </Pressable>
  );
};

export default AppButton;