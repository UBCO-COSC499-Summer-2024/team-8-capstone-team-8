import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // run npm install react-icons
import '../CourseCards.css';
import '../SearchBar.css';
import Card from './card';
const CourseCards = ({ navBarText, page}) => {

    
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:4000/courses');
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, []);
/* 
- Card has 3 different variables that can be passed in: courseCode, courseName, and user
- courseCode and courseName are required, while user is optional
- user is set to "stu" by default, but can be changed to "prof" which changing the course image.
- Adding a car component with the courseCode="Create Course" and courseName="Click to create a new course" 
  will create a card that will allow the user to create a new course.
 */
    

    if (page === "JoinCourse") {
        const [searchTerm, setSearchTerm] = useState('');

        // Filter courses based on search term
        const filteredCourses = courses.filter(course =>
            course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const handleSearchChange = (e) => {
            setSearchTerm(e.target.value);
        };
        return (
            <div>
                <div className="center-search">
                    <div className="search-container">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search a course"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="dashboard">
                    {filteredCourses.map(course => (
                        <Card 
                            key={course.courseId} 
                            courseCode={course.courseCode} 
                            courseName={course.courseName} 
                            user="stu"
                        />
                    ))}
                </div>
            </div>
        );
        // return(
        //     <div>
        //         <div className="center-search">
        //             <div className="search-container">
        //                 <div className="search-box">
        //                     <FaSearch className="search-icon" />
        //                     <input
        //                     type="text"
        //                     placeholder="Search a course"
        //                     value={searchTerm}
        //                     onChange={handleSearchChange}
        //                 />
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="dashboard">
        //             <Card courseCode="COSC 499" courseName="Software Engineering Capstone" user="stu"/>
        //             <Card courseCode="COSC 360" courseName="Intro to Web Development" user="stu"/>
        //             <Card courseCode="COSC 395" courseName="Intro to Frontend Development" user="stu"/>
        //         </div>
        //     </div>
        // );
    }else if (page === "stu/dashboard"){
        return (
            <div className="dashboard">
                {courses.map(course => (
                    <Card 
                        key={course.courseId} 
                        courseCode={course.courseCode} 
                        courseName={course.courseName} 
                        user="stu"
                    />
                ))}
            </div>
        );

        // return(
        //     <div className="dashboard">
        //         <Card courseCode="COSC 499" courseName="Software Engineering Capstone" user="stu"/>
        //         <Card courseCode="COSC 360" courseName="Intro to Web Development" user="stu"/>
        //         <Card courseCode="COSC 395" courseName="Intro to Frontend Development" user="stu"/>
        //     </div>
        // );
    }else{
        return (
            <div className="dashboard">
                {courses.map(course => (
                    <Card 
                        key={course.courseId} 
                        courseCode={course.courseCode} 
                        courseName={course.courseName}
                        user="prof" 
                    />
                ))}
            </div>
        );

        // return(
        //     <div className="dashboard">
        //         <Card courseCode="COSC 499" courseName="Software Engineering Capstone" user="prof"/>
        //         <Card courseCode="COSC 360" courseName="Intro to Web Development" user="prof"/>
        //         <Card courseCode="COSC 395" courseName="Intro to Frontend Development" user="prof"/>
        //         <Card couseCode="Create Course" courseName="Click to create a new course"/>
        //     </div>
        // );
    }
    
};

export default CourseCards;