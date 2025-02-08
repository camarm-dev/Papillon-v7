import { useTheme } from "@react-navigation/native";
import { Newspaper } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";

import { NativeText } from "@/components/Global/NativeComponents";
import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import {useNewsStore} from "@/stores/news";
import {updateNewsInCache} from "@/services/news";
import formatDate from "@/utils/format/format_date_complets";

const LastNewsWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const news = useNewsStore((store) => store.informations);

  useImperativeHandle(ref, () => ({
    handlePress: () => "News"
  }));

  const lastNews = useMemo(() => {
    return news.length > 0 ? news.sort((a, b) => a.date > b.date ? -1 : 0)[0] : null;
  }, [news]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!account?.instance) return;
      setLoading(true);
      try {
        await updateNewsInCache(account);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des actualités :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [account, setLoading]);


  useEffect(() => {
    const shouldHide = !lastNews || !account?.personalization.widgets?.lastNews;
    // setHidden(shouldHide);
    setHidden(false);
  }, [lastNews, setHidden]);

  if (!lastNews) {
    return null;
  }

  return (
    <>
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <Newspaper size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Dernière actualité
        </Text>
      </View>

      <Reanimated.View
        style={{
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "auto",
          gap: 5,
        }}
        layout={LinearTransition}
      >

        <NativeText
          variant="title"
          style={{
            width: "100%",
          }}
          numberOfLines={1}
        >
          {lastNews.title}
        </NativeText>
        <NativeText
          variant="body"
          style={{
            width: "100%",
          }}
          numberOfLines={2}
        >
          {lastNews.content}
        </NativeText>
        <View
          style={{
            marginTop: "auto",
            display: "flex",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <NativeText
            numberOfLines={1}
            variant="subtitle"
          >
            {formatDate(lastNews.date.toString())}
          </NativeText>

          {/*<NativeText*/}
          {/*  numberOfLines={1}*/}
          {/*  variant="subtitle"*/}
          {/*  style={{*/}
          {/*    width: "40%",*/}
          {/*  }}*/}
          {/*>*/}
          {/*  {lastNews.author}*/}
          {/*</NativeText>*/}
        </View>
      </Reanimated.View>
    </>
  );
});

export default LastNewsWidget;
