(function() {
    var key, goals,
        goods = {
            "대상": 2,
            "1등": 2,
            "2등": 3,
            "3등": 3,
            "4등": 5
        },
        memberList = "test1 test2 test3 test4 test5 test6";

    goals = [];
    for ( key in goods ) {
        while ( goods[key]-- ) {
            goals.push( key );
        }
    }

    window.ladderData = {};
    window.ladderData.members = memberList.split( " " );
    window.ladderData.goals = goals;
})();
