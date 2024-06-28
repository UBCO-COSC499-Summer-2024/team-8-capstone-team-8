import React from 'react';
import '../DesignRubric.css'; // Adjust the path if needed
import '../styles.css'; // Adjust the path if needed
import SideMenuBar from '../components/SideMenuBar';
import AIvaluateNavBar from '../components/AIvaluateNavBar';

const DDesignRubric  = () => {
    return (
        <div>
            <AIvaluateNavBar navBarText='COSC 499 - Software Engineering Capstone' />
            <SideMenuBar tab='assignments' />
            <div className="assignments-container">
                <main className="content">
                    <div className="assignment-details">
                    <div className="headerr">
                    
                        <div className="conn"><button className="back-button1">&#x2190;</button>
                        <h2> Build a Personal Portfolio Page</h2>
                        
                         
                            <div className="objective1">
                                <h3>Objective:</h3>
                                <p>Create a personal portfolio webpage using HTML and CSS. The webpage should include sections for an introduction, skills, projects, and contact information.</p>
                            </div>
                            <div className="requirements1">
                                <h3>Requirements:</h3>
                                <ol>
                                    <li>
                                        <h4>HTML Structure:</h4>
                                        <ul>
                                            <li>Use semantic HTML elements (e.g., &lt;header&gt;, &lt;section&gt;, &lt;footer&gt;).</li>
                                            <li>Include a navigation bar with links to different sections of the page.</li>
                                            <li>Create sections for Introduction, Skills, Projects, and Contact Information.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <h4>CSS Styling:</h4>
                                        <ul>
                                            <li>Use an external CSS file to style the webpage.</li>
                                            <li>Apply styles to ensure a visually appealing and responsive design.</li>
                                            <li>Use CSS Flexbox or Grid for layout.</li>
                                            <li>Include styles for fonts, colors, and spacing.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <h4>Content:</h4>
                                        <ul>
                                            <li>Introduction Section: Brief introduction about yourself with a heading and a paragraph.</li>
                                            <li>Skills Section: List of your skills in a visually appealing format (e.g., skill bars, icons).</li>
                                            <li>Projects Section: Showcase at least two projects with project titles, descriptions, and links (if available).</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    </div>
                </main>
            </div>
        </div>
        
    );
}

export default DDesignRubric;
