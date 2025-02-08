import React from "react";
import { Text, ScrollView, View, StyleSheet, Switch } from "react-native";
import { useTheme } from "@react-navigation/native";
import type { Screen } from "@/router/helpers/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeIconGradient, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import {
  CheckCircle,
  EyeOff,
  GraduationCap, Hourglass,
  LucideIcon,
  Newspaper
} from "lucide-react-native";
import { useCurrentAccount } from "@/stores/account";
import {WidgetsSettings} from "@/stores/account/types";
import {log} from "@/utils/logger/logger";
import DynamicWidgetsContainerCard from "@/components/Settings/DynamicWidgetsContainerCard";

type Widget = {
  name: string
  icon: LucideIcon
  description: string
  key: keyof WidgetsSettings
};

const SettingsWidgets: Screen<"SettingsWidgets"> = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const widgetsConfiguration = account?.personalization?.widgets || {};

  const widgets: Widget[] = [
    {
      name: "Vie scolaire",
      icon: CheckCircle,
      description: "Affiche le dernier évènement de vie scolaire.",
      key: "lastAttendanceEvent"
    },
    {
      name: "Actualités",
      icon: Newspaper,
      description: "Affiche la dernière actualité.",
      key: "lastNews"
    },
    {
      name: "Évaluations",
      icon: GraduationCap,
      description: "Affiche la prochaine évaluation.",
      key: "nextTest"
    }
  ];

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingBottom: 30,
      }}
    >
      <DynamicWidgetsContainerCard theme={theme} />

      <NativeListHeader label="Widgets" />
      <NativeList>
        {widgets.map(widget => (
          <NativeItem
            trailing={
              <Switch
                value={widgetsConfiguration[widget.key] as boolean ?? false}
                onValueChange={(value) => mutateProperty("personalization", { widgets: {...widgetsConfiguration, [widget.key]: value } })}
              />
            }
            leading={
              <NativeIconGradient
                icon={<widget.icon/>}
                colors={[colors.primary, colors.primary]}
              />
            }
          >
            <NativeText variant="title">
              {widget.name}
            </NativeText>
            <NativeText variant="subtitle">
              {widget.description}
            </NativeText>
          </NativeItem>
        ))}
      </NativeList>
      <NativeListHeader label="Paramètres" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={widgetsConfiguration.deleteAfterRead ?? false}
              onValueChange={(value) => mutateProperty("personalization", { widgets: {...widgetsConfiguration, deleteAfterRead: value } })}
            />
          }
          leading={
            <NativeIconGradient
              icon={<EyeOff />}
              colors={["#888888", "#888888"]}
            />
          }
        >
          <NativeText variant="title">
            Supprimer après lecture
          </NativeText>
          <NativeText variant="subtitle">
            Masque le widget après lecture.
          </NativeText>
        </NativeItem>
        <NativeItem
          trailing={
            <Switch
              value={widgetsConfiguration.deleteAfterRead ?? false}
              onValueChange={(value) => mutateProperty("personalization", { widgets: {...widgetsConfiguration, deleteAfterRead: value } })}
            />
          }
          leading={
            <NativeIconGradient
              icon={<Hourglass />}
              colors={["#888888", "#888888"]}
            />
          }
        >
          <NativeText variant="title">
            Masquer les évènements trop vieux
          </NativeText>
          <NativeText variant="subtitle">
            Affiche uniquement les évènements des {widgetsConfiguration.maxEventAge || 5} derniers jours.
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>
  );
};



export default SettingsWidgets;
