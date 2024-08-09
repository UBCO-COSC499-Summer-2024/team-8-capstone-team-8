import AIvaluateNavBar from '../components/AIvaluateNavBar';
import CourseCards from '../components/CourseCards';

const JoinCourse = () => {
  return (
    <div>
      <AIvaluateNavBar navBarText='Join a Course' tab="join-course" />
      <CourseCards page="JoinCourse"/>
    </div>
  );
};

export default JoinCourse;
