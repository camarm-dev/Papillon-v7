import React, { forwardRef, useEffect, useImperativeHandle, useState, useCallback, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Clock, ClockAlert } from "lucide-react-native";

import { WidgetProps } from "@/components/Home/Widget";
import WidgetHeader from "@/components/Home/WidgetHeader";
import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { getSubjectData } from "@/services/shared/Subject";
import { TimetableClass, TimetableClassStatus } from "@/services/shared/Timetable";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { updateTimetableForWeekInCache } from "@/services/timetable";

const lz = (num: number) => (num < 10 ? `0${num}` : num);

const TimetableChanges = forwardRef(({ hidden, setHidden, loading, setLoading }: WidgetProps, ref) => {
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);
  const [changedCourse, setChangedCourse] = useState<TimetableClass | null>(null);

  const currentWeekNumber = useMemo(() => dateToEpochWeekNumber(new Date()), []);

  useImperativeHandle(ref, () => ({
    handlePress: () => "Lessons"
  }));

  const fetchTimetable = useCallback(async () => {
    if (!timetables[currentWeekNumber] && account.instance) {
      setLoading(true);
      try {
        await updateTimetableForWeekInCache(account, currentWeekNumber);
      } finally {
        setLoading(false);
      }
    }
  }, [account, currentWeekNumber, timetables, setLoading]);

  const updateChangedCourse = useCallback(() => {
    const todayDate = new Date();
    const today = todayDate.getTime();

    if (!account.instance || !timetables[currentWeekNumber]) {
      setChangedCourse(null);
      setHidden(true);
      return;
    }

    const todayCourses = timetables[currentWeekNumber]
      .filter(c => c.endTimestamp > today)
      .sort((a, b) => a.startTimestamp - b.startTimestamp);

    let updatedChangedCourse = todayCourses
      .splice(todayCourses.length - 1, 1) // Deleting next course, because it is showedby next course widget
      .find(course => course.status); // Status is undefined if course is "normal"

    setChangedCourse(updatedChangedCourse || null);
    setHidden(!updatedChangedCourse);
    setLoading(false);
  }, [account.instance, timetables, currentWeekNumber, setHidden, setLoading]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  useEffect(() => {
    if (account.personalization.widgets?.timetableChangements && changedCourse) {
      setChangedCourse(changedCourse);
      setHidden(false);
    }
    setLoading(false);
  }, [account, timetables]);

  useEffect(() => {
    setLoading(true);
    updateChangedCourse();
  }, [updateChangedCourse, setLoading]);

  return !hidden && (
    <View style={{ width: "100%", height: "100%" }}>
      <WidgetHeader icon={<ClockAlert />} title="Changement EDT" />
      {changedCourse ? (
        <NextCourseLesson nextCourse={changedCourse} />
      ) : (
        <View style={{ width: "100%", height: "88%", justifyContent: "center", alignItems: "center", gap: 8 }}>
          {loading && <ActivityIndicator />}
          <Text style={{ color: "gray", fontSize: 15, fontFamily: "medium" }}>
            {loading ? "Chargement..." : "Aucun cours"}
          </Text>
        </View>
      )}
    </View>
  );
});

const NextCourseLesson: React.FC<{
  nextCourse: TimetableClass
}> = ({ nextCourse }) => {
  const [subjectData, setSubjectData] = useState({ color: "#888888", pretty: "Matière inconnue" });
  const colors = useTheme().colors;
  const [prettyTime, setPrettyTime] = useState("");

  useEffect(() => {
    const fetchSubjectData = async () => {
      const data = await getSubjectData(nextCourse.title);
      setSubjectData(data);
    };
    fetchSubjectData();
  }, [nextCourse.title]);

  useEffect(() => {
    const updateRemainingTime: () => number | NodeJS.Timeout = () => {
      const now = new Date().getTime();
      const distance = nextCourse.startTimestamp - now;
      const end = nextCourse.endTimestamp - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setPrettyTime(`dans ${days} jour(s)`);
        } else if (hours > 0) {
          setPrettyTime(`dans ${hours}h ${lz(minutes)}min`);
        } else {
          setPrettyTime(`dans ${minutes}min`);
        }
      } else if (end > 0) {
        const hours = Math.floor((end % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((end % (1000 * 60 * 60)) / (1000 * 60));
        setPrettyTime(`reste ${hours}h ${lz(minutes)}min`);
      } else {
        setPrettyTime("Terminé");
      }

      // Schedule next update at the start of the next minute
      const nextMinute = new Date(now);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);
      nextMinute.setMinutes(nextMinute.getMinutes() + 1);
      const delay = nextMinute.getTime() - now;
      return setTimeout(updateRemainingTime, delay);
    };

    const timeout = updateRemainingTime();

    return () => clearTimeout(timeout);
  }, [nextCourse]);

  return (
    <View style={{ width: "100%", marginTop: 10, flex: 1, flexDirection: "row", gap: 10 }}>
      <ColorIndicator color={subjectData.color} style={{ flex: 0 }} />
      <View style={{ flex: 1, width: "100%", justifyContent: "space-between" }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 17, fontFamily: "semibold" }}>
          {subjectData.pretty}
        </Text>
        <View style={{
          paddingHorizontal: 7,
          paddingVertical: 3,
          backgroundColor: subjectData.color + "33",
          borderRadius: 8,
          borderCurve: "continuous",
          alignSelf: "flex-start",
        }}>
          <Text
            numberOfLines={1}
            style={{
              color: subjectData.color,
              fontSize: 15,
              fontFamily: "semibold",
            }}
          >
            {nextCourse.room
              ? nextCourse.room.includes(",")
                ? "Plusieurs salles dispo."
                : nextCourse.room
              : "Salle inconnue"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, opacity: 0.5 }}>
          <Clock size={20} color={colors.text} />
          <Text numberOfLines={1} style={{ color: colors.text, fontSize: 15, fontFamily: "medium" }}>
            {prettyTime}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TimetableChanges;
