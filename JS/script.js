import schedule from '../data/schedule.js';

const todaySchedule = [];
let weekdays;
let coursesNow = [];
let nextCourse = new Array(1).fill(0);
let differentDay = false;

let day = new Date().getDay();


// Load appropriate data from JSON

for (const item in schedule) {
    weekdays = Object.keys(schedule[item]);
    let todayData;

    while(1) {
        if (day < 6) {
            todayData = schedule[item][weekdays[day - 1]];
        } else {
            todayData = schedule[item][weekdays[0]];
            differentDay = true;
        }

        if (Object.keys(todayData).length == 1) {
            differentDay = true;
            day++;
        } else {
            break;
        }
    }
    
    // Arrange data

    todayData.forEach(course => {
        let startTime = parseInt(course['startTime'].slice(0, 2));
        let endTime = parseInt(course['endTime'].slice(0, 2));
        let courseLength = endTime - startTime;
        
        if (courseLength == 1) {
            todaySchedule.push(course);
        } else if (courseLength > 1) {
            for (let i = 0; i < courseLength; i++) {
                let tmpCourse = new Object();
                Object.assign(tmpCourse, course);
                
                let tmpStartTime = ((startTime + i) != 10 && 10 % (startTime + i) != 10) ? "0" : "";
                tmpStartTime += (startTime + i).toString() + "00";
                
                let tmpEndTime = ((startTime + 1 + i) != 10 && 10 % (startTime + i + 1) != 10) ? "0" : "";
                tmpEndTime += (startTime + i + 1).toString() + "00";
                
                tmpCourse['startTime'] = tmpStartTime;
                tmpCourse['endTime'] = tmpEndTime;
                
                todaySchedule.push(tmpCourse);
            }
        }
    });
}


// Combine same courses

let hourNow = new Date().getHours();

function checkCourseNext(firstCourse, secondCourse, hour) {
    if (parseInt(todaySchedule[secondCourse]['startTime'].slice(0, 2)) == hour && 
        todaySchedule[firstCourse]['course'] == todaySchedule[secondCourse]['course'] &&
        todaySchedule[firstCourse]['type'] == todaySchedule[secondCourse]['type']) {
            return true;
    } else {
        return false;
    }
}

for (let i = 0; i < todaySchedule.length; i++) {
    let startTime = parseInt(todaySchedule[i]['startTime'].slice(0, 2));
    if (startTime == hourNow && differentDay == false) {
        coursesNow.push(i);
        nextCourse[0] = i + 1;


        if (i + 1 < todaySchedule.length && checkCourseNext(i, i + 1, startTime + 1)) {
                coursesNow.push(i + 1);
                nextCourse[0]++;
        }

        if (i != 0 && checkCourseNext(i, i - 1, startTime - 1)) {
            coursesNow.push(i - 1)
        }

        if (nextCourse[0] + 1 < todaySchedule.length && checkCourseNext(nextCourse[0], nextCourse[0] + 1, parseInt(todaySchedule[nextCourse[0]]['startTime'].slice(0, 2)) + 1)) {
            nextCourse.push(nextCourse[0] + 1);
        }

        break;
    } else if (differentDay == true) {
        if (nextCourse[0] + 1 < todaySchedule.length && checkCourseNext(nextCourse[0], nextCourse[0] + 1, parseInt(todaySchedule[nextCourse[0]]['startTime'].slice(0, 2)) + 1)) {
            nextCourse.push(nextCourse[0] + 1);
        }
        break;
    }
}


// Display data

const scheduleList = document.getElementById('schedule-list');

for (let i = 0; i < todaySchedule.length; i++) {
    let course = todaySchedule[i];
    let scheduleItem;

    scheduleItem = `<div class="schedule-list-item">`

    if (coursesNow.includes(i)) {
        scheduleItem += `   <h1 class="schedule-list-item-hour schedule-list-primary-focused">${ course['startTime'].slice(0, 2) }:${ course['startTime'].slice(2, 4) }</h1>
                            <div class="schedule-list-item-data">
                                <h1 class="schedule-list-item-course schedule-list-primary-focused">${ course['course'] }</h1>
                                <div class="schedule-list-item-info">
                                    <h1 class="schedule-list-item-type schedule-list-primary-focused">${ course['type'] }</h1>`;
    } else if (nextCourse.includes(i)) {
        scheduleItem += `   <h1 class="schedule-list-item-hour schedule-list-secondary-focused">${ course['startTime'].slice(0, 2) }:${ course['startTime'].slice(2, 4) }</h1>
                            <div class="schedule-list-item-data">
                                <h1 class="schedule-list-item-course schedule-list-secondary-focused">${ course['course'] }</h1>
                                <div class="schedule-list-item-info">
                                    <h1 class="schedule-list-item-type schedule-list-secondary-focused">${ course['type'] }</h1>`;

    } else {
        scheduleItem += `   <h1 class="schedule-list-item-hour">${ course['startTime'].slice(0, 2) }:${ course['startTime'].slice(2, 4) }</h1>
                            <div class="schedule-list-item-data">
                                <h1 class="schedule-list-item-course">${ course['course'] }</h1>
                                <div class="schedule-list-item-info">
                                    <h1 class="schedule-list-item-type">${ course['type'] }</h1>`;
    }

    scheduleItem += `
                            
                                    <h1 class="schedule-list-item-professor">${ course['professor'] }</h1>
                                    <h1 class="schedule-list-item-location"><span>${ course['location'].slice(0, course['location'].length - 1) }</span>${ course['location'].substr(-1) }</h1>
                                </div>
                            </div>
                        </div>`;
    
    scheduleList.insertAdjacentHTML('beforeend', scheduleItem);
}


// Update top card

let courseNow = 0;

for (let i = 0; i < todaySchedule.length; i++) {
    let startTime = parseInt(todaySchedule[i]['startTime'].slice(0, 2));
    let endTime = parseInt(todaySchedule[i]['endTime'].slice(0, 2));
    
    if (hourNow >= startTime && hourNow < endTime && differentDay == false) {
        courseNow = i;
        break;
    }
}

const mainDiv = document.getElementById('main');

for (const item in schedule) {
    const course = schedule[item][weekdays[day - 1]][courseNow];
    let topCardElm = `<div id="top-card">
                        <div id="top-card-header">
                            <h1 id="top-card-course">${ course['course'] }</h1>
                            <h1 id="top-card-professor">${ course['professor'] }</h1>
                        </div>
                        <h1 id="top-card-location"><span>${ course['location'].slice(0, course['location'].length - 1) }</span>${ course['location'].substr(-1) }</h1>
                        </div>
                        <div id="top-card-time">
                            <h1 id="top-card-time-header">${ course['startTime'].slice(0, 2)}:${ course['startTime'].slice(2, 4) } - ${ course['endTime'].slice(0, 2)}:${ course['endTime'].slice(2, 4) }</h1>
                        </div>`;

    mainDiv.insertAdjacentHTML('afterbegin', topCardElm);
}