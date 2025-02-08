import {ForwardRefExoticComponent, RefAttributes} from "react";
import GeneralAverageWidget from "./Components/GeneralAverage";
import NextCourseWidget from "./Components/NextCourse";
import LastGradeWidget from "./Components/LastGrade";
import RestaurantQRCodeWidget from "./Components/RestaurantQRCode";
import RestaurantBalanceWidget from "./Components/RestaurantBalance";
import LastNewsWidget from "@/widgets/Components/LastNews";
import LastAttendanceEventWidget from "@/widgets/Components/LastAttendanceEvent";
import {WidgetProps} from "@/components/Home/Widget";

interface Widget {
  component: ForwardRefExoticComponent<WidgetProps & RefAttributes<unknown>>
  isLarge: boolean
}

export const Widgets: Widget[] = [
  {
    component: RestaurantQRCodeWidget,
    isLarge: false
  },
  {
    component: RestaurantBalanceWidget,
    isLarge: false
  },
  {
    component: NextCourseWidget,
    isLarge: false
  },
  {
    component: GeneralAverageWidget,
    isLarge: false
  },
  {
    component: LastGradeWidget,
    isLarge: false
  },
  {
    component: LastNewsWidget,
    isLarge: true
  },
  {
    component: LastAttendanceEventWidget,
    isLarge: false
  }
];
