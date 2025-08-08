import {
  IconLayoutDashboard,
  IconClipboardList,
  IconFileText,
  IconPencil,
  IconQuestionMark,
  IconClipboardCheck,
  IconEdit,
} from '@tabler/icons-react';

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    navlabel: true,
    subheader: 'Student',
  },
  {
    id: uniqueId(),
    title: 'Exams',
    icon: IconClipboardList,
    href: '/exam',
  },
  {
    id: uniqueId(),
    title: 'Result',
    icon: IconFileText,
    href: '/result',
  },
  {
    navlabel: true,
    subheader: 'Teacher',
  },
  {
    id: uniqueId(),
    title: 'Create Exam',
    icon: IconPencil,
    href: '/create-exam',
  },
  {
    id: uniqueId(),
    title: 'Add Questions',
    icon: IconQuestionMark,
    href: '/add-questions',
  },
  {
    id: uniqueId(),
    title: 'Edit Question',
    icon: IconEdit,
    href: '/edit-exam',
  },
  {
    id: uniqueId(),
    title: 'Exam Logs',
    icon: IconClipboardCheck,
    href: '/exam-log',
  },
  // Uncomment if needed
  // {
  //   id: uniqueId(),
  //   title: 'Exam Sale comp',
  //   icon: IconPlayerPlayFilled,
  //   href: '/generate-report',
  // },
  // {
  //   id: uniqueId(),
  //   title: 'Sample Page',
  //   icon: IconAperture,
  //   href: '/sample-page',
  // },
];

export default Menuitems;