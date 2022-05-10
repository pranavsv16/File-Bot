## Deployment scripts and screencast:
1. create hosts file in /etc/ansible/ folder.

2. Add following 2 lines to hosts file and replace <UNITY_USERNAME>, <UNITY_PASSWORD> with unity username and password respectively.

```
[webserver]
152.7.176.227 ansible_ssh_pass=<UNITY_PASSWORD> ansible_ssh_user=<UNITY_USERNAME> ansible_python_interpreter=/usr/bin/python3
```

3. set env variable on control host with below command (<PERSONAL_ACCESS_TOKEN> is submitted in secret form).

```
set env variable for mac

step 1 :  vi ~/.zshenv
step 2 : export GITHUB_ACCESS_TOKEN=<PERSONAL_ACCESS_TOKEN>
step 3 : source ~/.zshenv
```

4. Run below command to start file bot on VCL server. ([deploy.yml](https://github.ncsu.edu/csc510-s2022/CSC510-15/blob/main/deploy.yml))

```
cd /etc/ansible/
ansible-playbook deploy.yml -e "GITHUBTOKEN={{lookup('env', 'GITHUB_ACCESS_TOKEN')}}"
```

5. Go to path /home/ynghatol/CSC-510-15/bot/ and enter the SLACK_TOKEN credentials in .env file (token credentials are submitted in secret form)

6. Go to path /home/ynghatol/CSC-510-15/bot/ and Run below command to start file bot server.

```
forever start slack.js
```

7. Now, file bot server is started, you can login in slack with test user. (credentials for test user are submitted in secret form)

8. Go to File Bot under Apps section and enter message '/filebot'

**Screencast:**
Click [here](https://web.microsoftstream.com/video/c6573d42-d2f4-43f2-88d2-1f3ce6914eb7) for screencast

**Acceptance Testing:**
:large_orange_diamond: **_Instructions to test the Usecase 1: `File Extraction: Summary Report`_**

:small_blue_diamond: [Happy Flow](https://github.ncsu.edu/csc510-s2022/CSC510-15/tree/main/img/workflows/UC1_HF.png) (Successful):

> User Action: Go to the FileBot app channel and invoke the FileBot by entering the below command and then hit enter.

> /filebot

> **_Bot Action:_** Now, the FileBot is invoked and it displays the CSV file services it provides as the menu options.
>
> **User Action --> :** Click on the first menu option which is File Extraction: Summary Report
>
> **_Bot Action:_** On clicking this menu option, the FileBot asks the github url of the CSV file.
>
> **User Action --> :** Enter a valid github url, [example URL](https://github.com/pranavsv16/Algorithms/blob/master/amazon.graph.small.csv).
>
> \***\*Bot Action:\*\*** The FileBot will provide the summary report of the provided CSV file which includes:
>
> 1. Number of Rows
> 2. Number of Columns
> 3. Column Name and Column Type
>
> The FileBot service ends here.

:large_orange_diamond: **_Instructions to test the Usecase 2: `File Conversions`_**

:small_blue_diamond: [Happy Flow](https://github.ncsu.edu/csc510-s2022/CSC510-15/tree/main/img/workflows/UC2_1_HF.png) (Successful):

> User Action: Go to the FileBot app channel and invoke the FileBot by entering the below command and then hit enter.

> /filebot

> **_Bot Action:_** Now, the FileBot is invoked and it displays the CSV file services it provides as the menu options.
>
> **User Action --> :** Click on the second menu option which is File Conversion.
>
> **_Bot Action:_** On clicking this menu option, the FileBot asks the github url of the CSV file.
>
> **User Action --> :** Enter a valid github url, [example URL](https://github.com/pranavsv16/Algorithms/blob/master/amazon.graph.small.csv).
>
> **_Bot Action:_** The FileBot will provide two options : 1. JSON, 2. XLSX.
>
> **User Action --> :** Click/Select on either of the options.
>
> **_Bot Action:_** The FileBot will provide the converted file for the user to download.
>
> The FileBot service ends here.

:large_orange_diamond: **_Instructions to test the Usecase 3: `File Manipulation`_**

:small_blue_diamond: Happy Flow(Successful):

> User Action: Go to the FileBot app channel and invoke the FileBot by entering the below command and then hit enter.

> /filebot

> **_Bot Action:_** Now, the FileBot is invoked and it displays the CSV file services it provides as the menu options.
>
> **User Action --> :** Click on the third menu option which is File Manipulation.
>
> **_Bot Action:_** On clicking this menu option, the FileBot asks the github url of the CSV file.
>
> **User Action -->:** Enter a valid github url, [example URL](https://github.com/pranavsv16/Algorithms/blob/master/amazon.graph.small.csv).
>
> **_Bot Action:_** The FileBot will provide two options : 1. Drop a Column, 2. Truncate Rows.

**_Instructions to test the above options_**

:small_blue_diamond: [Subflow 1](https://github.ncsu.edu/csc510-s2022/CSC510-15/tree/main/img/workflows/UC3_1_HF.png):

> **User Action -->:** Select option `Drop a Coulumn`.
>
> **_Bot Action:_** The FileBot will ask for the column name.
>
> **User Action -->:** Enter valid column number in format - "column #" which is case sensitive.
>
> **_Bot Action:_** The FileBot will provide the updated file with dropped column.

> The FileBot service ends here.

:small_blue_diamond: [Subflow 2](https://github.ncsu.edu/csc510-s2022/CSC510-15/tree/main/img/workflows/UC3_2_HF.png):

> **User Action -->:** Select option `Truncate Rows`
>
> **_Bot Action:_** The FileBot will ask for the range of rows.
>
> **User Action -->:** Enter valid row range in format - "From-to".
>
> **_Bot Action:_** The FileBot will provide the updated file with truncated rows.

> The FileBot service ends here.

:small_blue_diamond: [Alternate Flow](https://github.ncsu.edu/csc510-s2022/CSC510-15/tree/main/img/workflows/col_ne.png)(Unsuccesful) for `Drop a Coulumn`. : Invalid Column value entered for "Drop a Column" option.

> **User Action -->:** Enter a column number which is not in the mentioned CSV file.
>
> **_Bot Action:_** Filebot responds with "Please enter valid column number".

> The service ends here.

:small_blue_diamond: Alternate Flow(Unsuccessful) 1: for `Truncate Rows` : Out of range entered for "Truncate Rows" option.

> **User Action -->:** Enter a range which is not in the mentioned CSV file.
>
> **_Bot Action:_** Filebot responds with "Entered rows more than row count in csv file"

> The service ends here.

:small_blue_diamond: [Alternate Flow](https://github.ncsu.edu/csc510-s2022/CSC510-15/tree/main/img/workflows/rows_ne.png)(Unsuccessful) 2: for `Truncate Rows`: Invalid range entered for "Truncate Rows" option.

> **User Action -->:** Enter a range which is invalid (not in mentioned format).
>
> **_Bot Action:_** Filebot responds with "Enter the range numbers correctly, in ascending order"

> The service ends here.

:large_orange_diamond: **_Instrunctions to test the alternate flows for UC1, UC2 and UC3_**

:small_blue_diamond: [Alternate Flow](https://github.ncsu.edu/csc510-s2022/CSC510-15/tree/main/img/workflows/URL_Not.png): Wrong URL

> **User Action -->:** Go to the FileBot app channel and invoke the FileBot by entering the below command and then hit enter.
>
> /filebot
>
> **_Bot Action:_** Now, the FileBot is invoked and it displays the CSV file services it provides as the menu options.
>
> **User Action -->:** Click on the first menu option which is File Extraction: Summary Report
>
> **_Bot Action:_** On clicking this menu option, the FileBot asks the github url of the CSV file.
>
> **User Action -->:** Enter a url which has https, github.com and .csv words file but that url is not a valid url.
>
> **_Bot Action:_** The File Bot responds with a message "Sorry! URL does not exist"

> The service ends here

:small_blue_diamond: Bot will not repond in following case-

> **User Action -->:** User should go to the FileBot app channel and invoke the FileBot by entering the below command and then hit enter.
>
> /filebot
>
> **_Bot Action:_** Now, the FileBot is invoked and it displays the CSV file services it provides as the menu options.
>
> **User Action -->:** Click on the first menu option which is File Conversion.
>
> **_Bot Action:_** On clicking this menu option, the FileBot asks the github url of the CSV file.
>
> **User Action -->:** Enter random message not mentioned in the above flows.
>
> **_Bot Action:_** Bot will not respond until the user follows the above mentioned flows. (Happy and Alternate flows

## Exploratory Testing and Code Inspection
We haven't hard-coded interaction/mock data for our FileBot
note: We are not removing nock data as it was part of one of the previous milestones, nevertheless we are not using it anywhere in our bot interaction hence, it can be seen as grayed out in the code.

Added Process Reflection to Process.md file, please find it here: [PROCESS](https://github.ncsu.edu/csc510-s2022/CSC510-15/blob/main/process.md)

Click [here](https://github.ncsu.edu/csc510-s2022/CSC510-15/blob/main/worksheet.md) for the updated worksheet.md

