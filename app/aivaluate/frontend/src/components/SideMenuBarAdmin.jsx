import CircumIcon from "@klarr-agency/circum-icons-react";
import React from 'react';
import { Link } from 'react-router-dom'; // to prevent page reload
import '../GeneralStyling.css';
import '../SideMenu.css';

const SideMenuBarAdmin = ({tab}) => {
  
    return (
        <div className="fourth-colorbg side-menu">
            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="user"/>
                </div>
                <div className="link-div">
                    <Link to={`/admin/evaluatormanager`} className={`${tab === "evalManager" ? 'primary-color-text' : 'third-color-text'}`}>Evaluator Manager</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="user"/>
                </div>
                <div className="link-div">
                    <Link to={`/admin/studentmanager`} className={`${tab === "studentManager" ? 'primary-color-text' : 'third-color-text'}`}>Student Manager</Link>
                </div>
            </div>

            <div className="class-selection">
                <div className="icon-div">
                    <CircumIcon name="circle_list"/>
                </div>
                <div className="link-div">
                    <Link to={`/admin/coursemanager`} className={`${tab === "courseManager" ? 'primary-color-text' : 'third-color-text'}`}>Course Manager</Link>
                </div>
            </div>
            {/* <a href="/admin/evaluatormanager" className={`${tab === "evalManager" ? 'primary-color-text' : 'third-color-text'}`}>Evaluator Manager</a>
            <a href="/admin/studentmanager" className={`${tab === "studentManager" ? 'primary-color-text' : 'third-color-text'}`}>Student Manager</a> */}
        </div>
    )
}
export default SideMenuBarAdmin;