import React from "react";
import { StyleSheet, View } from "react-native";

import Reanimated, { FadeIn, FadeOut, LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { PressableScale } from "react-native-pressable-scale";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

export const PapillonModernHeader: React.FC<{
  children: React.ReactNode,
  outsideNav?: boolean,
  color?: string,
}> = ({ children, outsideNav, color }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const gradientColor = color ? color : theme.colors.background;

  return (
    <>
      <LinearGradient
        colors={[gradientColor + "EE", gradientColor + "00"]}
        locations={[0.5, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: outsideNav ? 70 : insets.top + 70,
          zIndex: 90,
        }}
      />

      <Reanimated.View
        style={[{
          paddingHorizontal: 16,
          paddingVertical: 8,
          position: "absolute",
          left: 0,
          top: outsideNav ? 24 : insets.top,
          zIndex: 100,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }]}
        layout={animPapillon(LinearTransition)}
      >
        {children}
      </Reanimated.View>

      {outsideNav &&
        <View
          style={{
            position: "absolute",
            top: 10,
            alignSelf: "center",
            height: 5,
            width: 50,
            backgroundColor: theme.colors.text + "22",
            borderRadius: 80,
            zIndex: 10000,
          }}
        />
      }
    </>
  );
};

export const PapillonHeaderAction: React.FC<{
  onPress?: () => void,
  children?: React.ReactNode,
  icon?: React.ReactNode,
  style?: any,
  animated?: boolean,
  entering?: any,
  exiting?: any,
  iconProps?: any,
}> = ({
  onPress,
  children,
  icon,
  style,
  animated = true,
  entering = animPapillon(FadeIn),
  exiting = animPapillon(FadeOut),
  iconProps,
}) => {
  const theme = useTheme();

  const newIcon = icon && React.cloneElement(icon as any, {
    size: 22,
    strokeWidth: 2.3,
    color: theme.colors.text,
    ...iconProps,
  });

  return (
    <Reanimated.View
      layout={animated && animPapillon(LinearTransition)}
      entering={entering && entering}
      exiting={exiting && exiting}
    >
      <PressableScale
        activeScale={0.85}
        weight="light"
        onPress={onPress}
        style={[{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background + "ff",
          borderColor: theme.colors.border + "dd",
          borderWidth: 1,
          borderRadius: 800,
          height: 40,
          width: 40,
          minWidth: 40,
          minHeight: 40,
          gap: 4,
          shadowColor: "#00000022",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
        }, style]}
      >
        {newIcon}
        {children}
      </PressableScale>
    </Reanimated.View>
  );
};

export const PapillonHeaderSeparator: React.FC = () => {
  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
      style={{
        flex: 1
      }}
    />
  );
};

export const PapillonHeaderSelector: React.FC<{
  children: React.ReactNode,
  onPress?: () => void,
  onLongPress?: () => void,
  loading?: boolean,
}> = ({
  children,
  onPress,
  onLongPress,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <PressableScale
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={[{
            backgroundColor: theme.colors.text + 16,
            overflow: "hidden",
            borderRadius: 80,
          }]}
        >
          <BlurView
            style={[styles.weekPicker, {
              backgroundColor: "transparent",
            }]}
            tint={theme.dark ? "dark" : "light"}
          >
            {children}

            {loading &&
              <PapillonSpinner
                size={18}
                color={theme.colors.text}
                strokeWidth={2.8}
                entering={animPapillon(ZoomIn)}
                exiting={animPapillon(ZoomOut)}
                style={{
                  marginLeft: 5,
                }}
              />
            }
          </BlurView>
        </Reanimated.View>
      </PressableScale>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "absolute",
    top: 0,
    left: 0,
  },

  weekPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 80,
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignSelf: "flex-start",
    overflow: "hidden",
  },

  weekPickerText: {
    zIndex: 10000,
  },

  weekPickerTextIntl: {
    fontSize: 14.5,
    fontFamily: "medium",
    opacity: 0.7,
  },

  weekPickerTextNbr: {
    fontSize: 16.5,
    fontFamily: "semibold",
    marginTop: -1.5,
  },

  weekButton: {
    overflow: "hidden",
    borderRadius: 80,
    height: 38,
    width: 38,
    justifyContent: "center",
    alignItems: "center",
  },
});