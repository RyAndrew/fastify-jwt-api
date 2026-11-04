import { FastifyInstance } from 'fastify'

// U.S.A. first names extracted from nam_dict.txt (Jörg Michael, GNU FDL 1.2).
// Keyed by frequency: 1 (rare) .. 13 (extremely common), logarithmic — each step is ~2x.
type Tiers = Record<number, string>

const FIRST_NAMES: Record<'male' | 'female' | 'unisex', Tiers> = {
  male: {
    9:
      'David James John Michael Richard Robert William',
    8:
      'Charles Christopher Daniel Donald Joseph Kenneth Mark Paul Steven Thomas',
    7:
      'Andrew Anthony Brian Dennis Douglas Edward Eric Frank Gary George Gregory Jason Jeffrey ' +
      'Jerry Joshua Kevin Larry Matthew Patrick Raymond Ronald Scott Stephen Terry Timothy',
    6:
      'Aaron Adam Alan Albert Arthur Benjamin Billy Bobby Brandon Bruce Bryan Carl Craig Dale ' +
      'Danny Gerald Harold Henry Jack Jacob Jeremy Joe Johnny Jonathan Jose Justin Keith Lawrence ' +
      'Nicholas Peter Philip Ralph Randy Roger Roy Russell Ryan Samuel Sean Shawn Todd Walter ' +
      'Wayne Willie',
    5:
      'Alex Alexander Alfred Allen Antonio Austin Barry Bernard Bill Bradley Brent Calvin Carlos ' +
      'Chad Chris Christian Clarence Clifford Cody Corey Curtis Darrell Dean Derek Don Dustin ' +
      'Earl Eddie Edwin Ernest Eugene Francis Fred Frederick Glenn Harry Herbert Howard Jay Jeff ' +
      'Jeffery Jerome Jesse Jim Jimmy Joel Jon Jordan Juan Kyle Lee Leonard Louis Luis Marc ' +
      'Marcus Martin Marvin Melvin Micheal Mike Nathan Nathaniel Norman Phillip Randall Ray Ricky ' +
      'Rodney Ronnie Shane Stanley Steve Taylor Theodore Tommy Tony Travis Troy Tyler Victor ' +
      'Vincent Wesley Zachary',
    4:
      'Adrian Allan Alvin Andre Arnold Blake Bob Brad Brett Caleb Cameron Cecil Charlie Chester ' +
      'Clayton Clinton Clyde Cory Dan Darren Darryl Daryl Derrick Devin Duane Dwayne Dwight Dylan ' +
      'Edgar Erik Ethan Evan Floyd Franklin Freddie Gabriel Gene Gilbert Glen Gordon Greg Guy ' +
      'Harvey Herman Ian Isaac Jared Jeremiah Jesus Jimmie Johnnie Karl Kent Kirk Kurt Lance Leo ' +
      'Leon Leroy Lester Lewis Lloyd Logan Lonnie Luke Manuel Mario Maurice Miguel Milton ' +
      'Mitchell Neil Noah Oscar Reginald Ricardo Rick Ruben Sam Seth Ted Tim Tom Trevor Tyrone ' +
      'Vernon Warren',
    3:
      'Abraham Alejandro Alton Andy Armando Ben Bennie Benny Brendan Bryant Bryce Byron Carlton ' +
      'Cedric Chase Clark Claude Clifton Cole Colin Connor Dakota Dallas Damon Darin Dave Delbert ' +
      'Devon Dick Dominic Donnie Doug Drew Earnest Ed Elijah Elmer Erick Everett Francisco ' +
      'Fredrick Garrett Garry Geoff Geoffrey Grant Gregg Hector Hugh Hunter Ira Isaiah Jackson ' +
      'Jake Joey Johnathan Jonathon Julian Julius Kelvin Ken Kenny Kristopher LeRoy Levi Loren ' +
      'Lucas Luther Lyle Malcolm Marshall Marty Mason Mathew Matt Max Mel Micah Mick Morris Myron ' +
      'Neal Nelson Nick Noel Oliver Otis Owen Perry Pete Phil Preston Randolph Raul Rex Rickey ' +
      'Riley Rob Roberto Roderick Ron Ross Rudolph Rudy Sammy Shaun Sidney Spencer Stuart Terence ' +
      'Terrance Terrence Tommie Virgil Wade Wallace Wendell Whitney Willard',
    2:
      'Abel Aidan Al Alec Alonzo Amos Archie Bart Bert Blaine Boyd Bradford Brady Bret Brock ' +
      'Buddy Carroll Carson Carter Cary Chuck Clay Cleveland Cliff Clint Colby Collin Colton ' +
      'Conrad Cornelius Cristian Curt Dalton Damian Damien Dane Dante Darius Darnell Darrel ' +
      'Darrin Darwin Demetrius Dewayne Dewey Dexter Dillon Dominick Donovan Doyle Edmond Edmund ' +
      'Elbert Eldon Eli Elias Elliot Elliott Ellis Emanuel Emmett Ernie Ervin Forrest Freddy ' +
      'Garland Gavin Gerry Grady Graham Harlan Harley Harrison Hayden Heath Herb Homer Horace ' +
      'Irvin Irving Ismael Israel Jamal Jarrod Jayson Jeffry Jerald Jermaine Jess Kaleb LaMont ' +
      'Lamar Landon Lane Laurence Leland Lionel Louie Lowell Mack Marcos Marlin Marlon Maxwell ' +
      'Merle Mickey Miles Mitch Monte Monty Moses Nickolas Nicolas Nolan Orville Parker Percy ' +
      'Quentin Ramiro Randal Reuben Reynaldo Rickie Rocky Rodger Rodolfo Rogelio Rolando ' +
      'Roosevelt Rory Royce Rufus Saul Scotty Sebastian Sheldon Sherman Simon Sterling Stewart ' +
      'Sylvester Tanner Teddy Terrell Thaddeus Timmy Toby Trent Trenton Tristan Ty Tyson Van ' +
      'Vance Wilbert Wilbur Wilfred Will Willis Wilson Winston Woodrow Wyatt Xavier',
    1:
      'Abe Abner Abram Adan Aden Adolph Adolphus Adonis Aiden Akeem Albin Alden Aldous Aldrich ' +
      'Alexandro Alford Ali Alijah Alister Aloysius Alvan Alvie Alvis Amarion Ambrose Ammon Amory ' +
      'Anderson Ansel Anson Antione Antwan Antwon Arden Ardy Aric Arlan Arland Arlen Arlie Arlin ' +
      'Arlo Armond Arnie Aron Arron Art Artie Artis Arvil Arvin Aryan Asa Attila Audie August ' +
      'Augustine Augustus Austen Auston Austyn Averell Aydan Ayden Barclay Barney Barnie Baron ' +
      'Barrett Barron Bartley Barton Basil Beau Benedict Benjiman Bennet Bennett Benton Bernie ' +
      'Berry Bertram Bibo Blane Blaze Bobo Booker Boyce Boyden Braden Bradly Bradon Bradyn ' +
      'Braeden Braedon Braiden Brain Brandan Branden Brandin Brandyn Brannon Brant Braxton Brayan ' +
      'Brayden Braydon Brenden Brendon Brennan Brennen Brennon Brenton Brice Brien Britt Britton ' +
      'Broderick Brodie Brody Bronson Brooks Brycen Bryon Bryson Buck Bucky Bud Buford Burl ' +
      'Burnell Burt Burton Buster Butch Buzz Cade Caden Caiden Cale Camden Camron Carleton ' +
      'Carlyle Carnell Casimer Casimir Casper Cayden Cedrick Chadd Chadrick Chadwick Chalmer ' +
      'Chance Chandler Channing Charley Charly Chas Chauncey Chaz Chet Chip Clair Clarance Claud ' +
      'Clem Cleon Clete Cletus Cleve Clovis Cloyd Coby Codey Codie Coleman Colt Colten Columbus ' +
      'Conan Conley Conner Conor Constantine Conway Cooper Corbin Cordell Cordero Cornell Corwin ' +
      'Coty Courtland Coy Crawford Cris Crispin Cristopher Cruz Cullen Cully Curtiss Cy Cyd Cyrus ' +
      'Dakotah Daley Dallin Dameon Damion Damond Dandre Dangelo Danial Dannie Dany Daquan Darell ' +
      'Daren Darian Darien Darion Darold Daron Darrian Darrick Darrien Darrion Darrius Darron ' +
      'Darry Darvin Daryle Daryll Dashawn Davin Davion Davis Davon Davonte Davy Dawson Dax Dayton ' +
      'DeAndre DeAngelo DeJuan DeMarcus DeMario DeShaun DeShawn Dedric Dedrick Deion Del Delano ' +
      'Dell Delmar Delmas Delmer Delroy Delton Delvin Delwyn Demarco Demond Dempsey Dennie Denny ' +
      'Denver Denzel Denzil Deon Deondre Deontae Deonte Dequan Derald Dereck Deric Derick Derik ' +
      'Dermot Deron Derrell Derryck Derryl Derwin Desmond Destin Devan Devante Deven Devonta ' +
      'Devontae Devonte Dewitt Dickie Dillan Dillard Dillion Dion Dionte Dixon Dolph Domenic ' +
      'Donavan Donell Donley Donn Donnell Donny Donta Dontae Donte Dorian Dorman Dorsey Douglass ' +
      'Drake Draven DuWayne Dudley Duffy Duke Duncan Durward Durwin Durwood Dusten Dusty Duwayne ' +
      'Dwain Dwaine Dwane Dylon Ean Earle Easton Edd Eddy Edison Edsel Efrain Efren Elden Eldred ' +
      'Eldridge Elgin Elian Ellery Ellsworth Ellwood Elmo Elmore Elon Elroy Elton Elvin Elvis ' +
      'Elwin Elwood Elwyn Elzie Emerson Emery Emmit Emmitt Emory Enoch Errol Esmond Estevan ' +
      'Evander Evann Everet Everette Ezekiel Ezell Ezequiel Ezra Fabian Faron Farrell Felton ' +
      'Ferdie Finn Fletcher Flynn Forest Foster Franklyn Frasier Frederic Fredric Freeman Gage ' +
      'Galen Garett Garfield Gari Garnett Garold Garret Garrick Garrison Garth Gauvin Gaven Gavyn ' +
      'Gayland Gaylon Gaylord Gearld Geary Geno Gerson Gideon Gil Giles Glendon Glynn Gordy Gore ' +
      'Granville Grayson Greggory Greyson Griffin Grover Gus Gustavo Haig Hal Hamilton Hamish ' +
      'Hank Hannibal Hansell Harding Hardy Harland Harlen Harlow Harmon Harper Harrell Harris ' +
      'Haskell Haydn Hayward Haywood Hedley Henderson Heriberto Herschel Hershel Hezekiah Hilbert ' +
      'Hillard Hilton Hobart Hobert Hod Holden Hollis Hosea Houston Howell Howie Hoyt Hudson Huey ' +
      'Humberto Hyman Ignatius Ike Irv Irwin Isaak Isadore Isai Isiah Isidore Issac Ivory Izaiah ' +
      'Jabari Jac Jace Jacky Jacoby Jaden Jadon Jaeden Jaheim Jairo Jakey Jaleel Jalen Jamar ' +
      'Jamarcus Jamari Jamarion Jame Jamel Jameson Jamey Jamin Jamison Jaquan Jaren Jarod Jaron ' +
      'Jarred Jarrell Jarret Jarrett Jarvis Jasen Jasper Javion Javon Javonte Jaxon Jaxson Jayce ' +
      'Jayden Jaydon Jaylan Jaylen Jaylon Jayme Jeb Jed Jedediah Jedidiah Jef Jefferson Jerad ' +
      'Jeramie Jeramy Jere Jered Jerel Jereme Jeremey Jeremie Jermey Jerod Jerold Jeromy Jerrell ' +
      'Jerrod Jerrold Jessy Jett Jevon Jocko Joely Johnathon Johnie Johnpaul Johnson Jonah Jonny ' +
      'Jorden Jordon Jory Josh Josiah Josue Judah Judd Jude Judge Judson Junius Justen Juston ' +
      'Justyn Juwan Kade Kadeem Kaden Kadin Kaiden Kale Kameron Kamron Kane Kareem Karson Kayden ' +
      'Keagan Keanu Keaton Kedrick Keegan Keenan Kegan Kelby Kellen Kelton Kendell Kendrick ' +
      'Kenley Kenn Kennan Kennie Kennith Kenton Kenyon Keon Kermit Kerwin Keshawn Kester Kev ' +
      'Kevan Keven Kevon Keyon Keyshawn Kian Kiel King Kip Kipp Kirby Kirt Kit Kobe Koby Kody ' +
      'Kolby Kole Kolton Korbin Korey Kory Kraig Kristian Kristofer Kurtis Kylan Kyler Ladarius ' +
      'Laddie Lafayette Laird Lambert Lamon Landen Langdon Lannie Lanny Laron Laurance Lavar ' +
      'Lawerence Lawson Layne Layton Leamon Leander Leeroy Leff Lemmy Lemuel Len Lenard Lennie ' +
      'Lenny Leonel Les Levar Liam Lincoln Lindell Lindley Linton Linwood Lon Lonn Lonny Loran ' +
      'Lorin Loring Lorne Loron Loy Loyal Loyd Lucian Lucious Lucius Lyman Lyndon Lynwood Maddox ' +
      'Mahlon Major Malachi Malik Markel Markell Marlan Marques Marquis Marquise Martell Marv ' +
      'Matty Maury Maverick Maxie Maynard McArthur McKinley Melton Melvyn Merl Merlin Merlyn ' +
      'Merrill Merritt Merton Mervin Micky Mikel Milburn Milford Millard Milo Milt Misael Mitchel ' +
      'Moises Monroe Montgomery Morry Mort Morton Mose Murphy Murray Myles Najee Napoleon Nat ' +
      'Nate Nathanael Nathanial Nathen Ned Nehemiah Nestor Newell Newt Newton Nic Nicky Nigel ' +
      'Nikolas Noble Noe Normand Norris Norton Norval Norwood Obie Odell Odis Olen Olin Omari ' +
      'Omarion Oneal Oral Oran Orin Orion Orland Orrin Orson Orval Orvil Otha Otho Ottis Ozzie ' +
      'Ozzy Palmer Parrish Paulie Paxton Percival Pernell Pierce Porter Prince Quincy Quinn ' +
      'Quinten Quintin Quinton Raekwon Raleigh Ramsey Rance Rand Randel Randell Randle Raphael ' +
      'Rashad Rashawn Rayburn Rayford Raymon Raynard Reece Reed Reg Reggie Reid Remington Reynold ' +
      'Rhett Rich Richie Ricki Rico Ridley Rigoberto Ritchie River Robb Robby Rock Rockford Rod ' +
      'Rodd Roddy Rodman Rodrick Rohan Rolland Rollie Rollin Ronni Ronny Roscoe Rosevelt Rowen ' +
      'Rowland Royal Rubin Rueben Rupert Rush Russ Russel Ryder Rylan Ryne Sal Samson Sanford ' +
      'Santos Savion Sawyer Schuyler Scot Scottie Sedrick Seneca Seymour Shad Shamar Shaquan ' +
      'Shaquille Shawne Shayne Sheffield Shelton Sherm Sherwin Sherwood Shon Sid Silas Simson ' +
      'Sincere Skip Skippy Solomon Sonny Spenser Stan Stanford Stanton Stephon Stevie Stone ' +
      'Stoney Storm Stu Syd Tab Tad Talmadge Talon Tam Tarquin Tate Taurean Taurus Tavares Tavon ' +
      'Tedd Telly Terrill Tevin Tex Thad Theron Thom Thurman Timmie Titus Tobin Tod Toney Torey ' +
      'Torrance Torrence Torrey Tory Trace Trae Travon Tre Tremaine Tremayne Trever Trevion ' +
      'Trevon Trey Trinidad Tristen Tristian Tristin Triston Truman Tucker Turner Tye Tylor ' +
      'Tyquan Tyree Tyrel Tyrell Tyrese Tyron Tyshawn Ulysses Uriah Vaughn Vergil Verl Verle ' +
      'Verlin Verlyn Vern Verne Vester Vic Vick Vin Vince Virgle Waldo Walker Wally Walt Walton ' +
      'Ward Wardell Warner Warrick Warwick Wayde Wayland Waylon Waymon Webster Weldon Wes Westley ' +
      'Weston Wilber Wilburn Wiley Wilford Wilfredo Willy Wilmer Wilton Windell Winfield Winford ' +
      'Winfred Woody Wylie Wyman Xander Zach Zachariah Zachery Zack Zackary Zackery Zak Zakary ' +
      'Zander Zane Zechariah Zed Zeke',
  },
  female: {
    9:
      'Mary',
    8:
      'Barbara Elizabeth Jennifer Karen Linda Lisa Patricia Susan',
    7:
      'Amanda Amy Angela Betty Brenda Carol Carolyn Christine Cynthia Deborah Debra Diane Donna ' +
      'Dorothy Janet Jessica Julie Kathleen Kimberly Laura Margaret Melissa Michelle Nancy Pamela ' +
      'Rebecca Sandra Sarah Sharon Shirley Stephanie',
    6:
      'Alice Andrea Ann Anna Ashley Beverly Bonnie Catherine Cheryl Christina Cindy Connie ' +
      'Crystal Dawn Denise Diana Doris Emily Frances Gloria Heather Helen Jacqueline Jamie Jane ' +
      'Janice Jean Joan Joyce Judith Judy Katherine Kathryn Kathy Kelly Leslie Lori Maria Marie ' +
      'Marilyn Martha Nicole Paula Peggy Phyllis Rachel Robin Rose Ruth Sara Shannon Tammy Teresa ' +
      'Theresa Tina Tracy Victoria Virginia Wendy',
    5:
      'Alexis Alicia Allison Amber Anita Anne Annette Annie April Audrey Beth Brittany Carla ' +
      'Carrie Cathy Charlene Charlotte Colleen Constance Courtney Dana Danielle Darlene Deanna ' +
      'Debbie Dolores Eileen Elaine Ellen Emma Erica Erin Evelyn Gail Geraldine Gina Grace Hannah ' +
      'Heidi Holly Irene Jeanette Jeanne Jill Jo Joanne Joy Juanita Julia Katie Kayla Kim Kristen ' +
      'Kristin Lauren Laurie Lillian Lois Loretta Lorraine Louise Lynn Marcia Marion Marjorie ' +
      'Marlene Maureen Megan Melanie Melinda Michele Mildred Monica Natalie Norma Regina Renee ' +
      'Rhonda Rita Roberta Rosemary Ruby Sally Samantha Sheila Sherry Stacey Stacy Sue Suzanne ' +
      'Sylvia Tamara Tara Terri Tiffany Tonya Valerie Vanessa Veronica Vicki Vickie Wanda Yvonne',
    4:
      'Abigail Alexandra Alison Alma Alyssa Arlene Beatrice Becky Belinda Bernice Bertha Billie ' +
      'Bobbie Brandi Brandy Brianna Bridget Brooke Candace Carmen Carole Caroline Cassandra ' +
      'Chelsea Christy Claire Clara Claudia Delores Dianne Edith Edna Eleanor Ella Erika Esther ' +
      'Ethel Eva Felicia Florence Gayle Georgia Gladys Glenda Gwendolyn Hazel Jacquelyn Jan ' +
      'Jasmine Jenna Jenny JoAnn Joann Joanna Jodi Jody Josephine June Kara Karla Katrina Kay ' +
      'Kelli Kelsey Kristi Kristina Kristine Kristy Leah Lindsay Lindsey Lucille Lucy Lydia Lynda ' +
      'Lynne Madeline Madison Margie Marian Marsha Maxine Melody Misty Molly Morgan Naomi Nina ' +
      'Olivia Patsy Patty Pauline Penny Priscilla Rosa Sabrina Sandy Shelby Shelley Shelly Sheri ' +
      'Sherri Sheryl Sonya Tanya Thelma Toni Tracey Vivian Wilma Yolanda',
    3:
      'Adrienne Aimee Alberta Alexandria Alisha Amelia Angelica Angelina Angie Antoinette Autumn ' +
      'Bernadette Bessie Bethany Betsy Bonita Briana Brittney Caitlin Camille Candice Cara ' +
      'Cathleen Cecelia Cecilia Celeste Cheri Cherie Chloe Christie Cora Daisy Darla Deb Debora ' +
      'Della Deloris Dena Desiree Destiny Dianna Dixie Dora Doreen Elsie Eunice Faith Faye ' +
      'Gabrielle Gale Geneva Genevieve Gertrude Ginger Gretchen Guadalupe Hailey Haley Harriet ' +
      'Hope Ida Jaclyn Janelle Janie Janis Jeannette Jeannie Jennie Jillian Jocelyn Kaitlyn Kari ' +
      'Kate Katelyn Kelley Kellie Kendra Kerri Kimberley Krista Kristie Krystal LaToya Lana ' +
      'Laurel Leigh Lena Leona Lesley Leticia Lillie Liz Lola Lora Lucinda Lynette Mackenzie Mae ' +
      'Maggie Mandy Marcella Marianne Marissa Marla Maryann Mattie Meghan Meredith Mia Mindy ' +
      'Minnie Miranda Miriam Myra Myrtle Nadine Natasha Nellie Nichole Nikki Nora Pam Patrice ' +
      'Patti Paulette Pearl Rachael Ramona Rebekah Robyn Rochelle Ronda Rosalie Rosemarie Rosie ' +
      'Roxanne Savannah Shari Shawna Shelia Sherrie Sierra Sonia Sophia Stacie Stella Susie ' +
      'Sydney Tabitha Tami Tammie Tasha Teri Therese Traci Tracie Tricia Trina Trisha Velma Vera ' +
      'Verna Vicky Viola Violet',
    2:
      'Abby Ada Adele Aileen Alana Alexa Alisa Alissa Allyson Alyson Amie Angelia AnnMarie Ariana ' +
      'Ariel Ashlee Ashleigh Audra Ava Bailey Barb Becca Bernadine Bette Bettie Bettye Beulah Bev ' +
      'Blanche Bobbi Breanna Bridgette Britney Caitlyn Callie Candy Carissa Carly Cassidy Cassie ' +
      'Celia Chandra Charity Charmaine Chasity Chelsey Cheyenne Christi Clare Clarissa Claudette ' +
      'Cleo Colette Corinne Daphne Darcy Deana Deanne Dee Deidre Deirdre Delia Dina Dona Ebony ' +
      'Elisa Elise Eloise Ericka Erma Ernestine Esmeralda Essie Estella Estelle Etta Eula Fannie ' +
      'Fay Flora Francine Freda Gay Glenna Gracie Greta Gwen Hattie Hayley Henrietta Hilary Hilda ' +
      'Hillary Inez Ivy Jada Jade Jami Janette Janine Jasmin Jayne Jeanie Jeanine Jenifer Jeri ' +
      'Jerri Jewel Jodie Jolene Joni Josie Julianne Justine Kaitlin Karina Kasey Katharine Kathie ' +
      'Kaylee Keisha Kenya Keri Kiara Kimberlee Kirsten Kylie LaDonna Lacey Lara Latasha Latisha ' +
      'Latonya Laverne Lea Leann Leanne Lela Lenora Lila Lily Lorena Lorene Lorie Lorna Lorrie ' +
      'Luann Lula Lupe Lynnette Mabel Mable Madelyn Makayla Malinda Mallory Mamie Marci Marcie ' +
      'Marcy Margo Mariah Maribel Marisol Maya Mayra Meagan Meg Melba Melisa Mollie Mona Muriel ' +
      'Myrna Nanette Nelda Nettie Noelle Noreen Opal Ora Pattie Penelope Polly Rachelle Rae Randi ' +
      'Raven Reba Rena Rosalind Rosalyn Rosanne Roseann Ruthie Sadie Sallie Sasha Saundra Selena ' +
      'Serena Shana Shanna Sharron Shauna Sheree Sondra Staci Suzette Tabatha Tamika Tammi Tania ' +
      'Tanisha Terrie Tessa Tia Tonia Tori Trinity Trudy Valarie Wendi Winifred Yesenia Zoe',
    1:
      'Aaliyah Abagail Abbe Abbey Abbie Abbigail Abigale Abigayle Abrytha Addie Adelaide Adeline ' +
      'Adell Adella Adelle Adria Adriane Adrianna Adrianne Agatha Ainsley Aisha Aiyana Aja Alaina ' +
      'Alanna Alayna Albertha Aleah Alecia Alene Alesha Alesia Aleta Aletha Alexandrea Alexia ' +
      'Alexus Alfreda Alia Alivia Alix Aliyah Aliza Alize Allene Allie Ally Allyn Allyssa Almeda ' +
      'Alondra Alpha Alta Altha Althea Alvera Alvina Alyce Alycia Alys Alysa Alyse Alysha Alysia ' +
      'Amani Amara Amely America Ami Amiya Amiyah Amya Amzie Anahi Anaya Andie Andria Angeline ' +
      'Angelita Angelyn Anissa Anitra Aniya Aniyah Anjanette AnnaRose Annabel Annabell Annabelle ' +
      'Annabeth Annalee Annamae Annetta Ansley Anthea Antonette Anya Ardella Ardeth Ardie Ardis ' +
      'Ardith Arely Aretha Aria Arianna Arielle Arla Arlee Arleen Arleigh Arline Aryana Aryanna ' +
      'Ashanti Ashely Ashli Ashlie Ashly Ashlyn Ashlynn Ashtyn Asia Aspen Athena Aubree Aubrie ' +
      'Audry Aundrea Avis Ayana Ayanna Ayleen Ayn Azrielle Babette Bailee Bambi Barbie Barbra ' +
      'Baylee Beaulah Beckie Bee Beezie Bella Belle Belva Benita Bernardine Berniece Bernita ' +
      'Bertie Beryl Bess Bessy Bethel BettyAnn Beverlee Beverley Billye Birdie Blossom Blythe ' +
      'Bobbye Bobette Bonny Brandee Brandie Brandilyn Breana Breann Breanne Bree Brenna Breonna ' +
      'Bria Brianne Bridgett Brielle Brigette Brigid Brionna Brisa Britany Britni Brittaney ' +
      'Brittani Brittanie Brittni Brittny Brook Brookie Brooklyn Brooklynn Bryana Bryanna Buffy ' +
      'Bulah Byrdie Cadence Cait Cali Calista Cally Camellia Cami Camilla Cammie Camryn Candi ' +
      'Candis Candyce Caprice Caren Cari Carie Carisa Carlee Carleen Carlene Carley Carli Carlie ' +
      'Carline Carma Carmelita Carmella Carolann Carolee Carolyne Carolynn Caron Carri Caryl ' +
      'Caryn Casandra Casie Cass Cassondra Catharine Cathey Cathie Cathrine Cathryn Catina ' +
      'Catrina Caty Cayla CeCe Cecily Celene Celestine Celina Chanda Chanel Chantel Chantelle ' +
      'Charissa Charisse Charla Charleen Charline Charlize Charolette Charrie Charyl Chastity ' +
      'Chaya Chelsi Chelsie Cher Cherilyn Cherise Cherish Cherri Cherry Cheryle Cheryll Cheyanne ' +
      'Chiquita Chrissie Chrissy Christal Christen Christene Christiana Chrystal Chyna Cicely ' +
      'Ciera Cierra Cinda Cindi Cindie Cissy Citlali Claribel Clarice Clementine Clemmie Cleta ' +
      'Coleen Colie Collette Coralee Cordelia Corene Cori Corina Corine Corliss Corrie Corrine ' +
      'Cortney Courteney Cozette Cristal Cristi Cristin Cristy Cybil Cyndee Cyndi Cyndie Cyndy ' +
      'Cyra Cyrena Dacia Daisha Damaris Danelle Danette Dani Daniella Danita Danna Danyelle Dara ' +
      'Darci Darcie Darleen Darline Dasia Dava Davina Dawna Dayana Dayanara Dayle Dayna DeAnne ' +
      'DeDe DeRae Deann Debbee Debbi Debbra Debby Debi Debrah Dedra DeeDee Deeann Deena Deidra ' +
      'Deja Delaney Delilah Delinda Delisa Dellene Delma Delois Delphia Demetria Demi Deneen ' +
      'Denel Denice Deniece Desi Desirae Dessie Destinee Destiney Destini Devina Di DiAnn Diamond ' +
      'Dian Diann Diantha Didi Dimple Dinah Dionne Dollie Dolly Donetta Donette Donielle Donita ' +
      'Dorcas Dorene Doretha Dori Dorie Dorinda Dorla Dorotha Dorrie Dorris Dortha Dorthy Dory ' +
      'Dottie Dotty Dovie Dyan Dyana Earlean Earlene Earline Earnestine Eartha Easter Eboni Eden ' +
      'Edie Edwina Edythe Effie Elaina Elayne Eldora Eleanora Eleanore Elease Elenora Elida ' +
      'Elinor Elinore Elisha Elissa Eliza Elle Ellie Ellory Elma Elnora Elois Elouise Elsa ' +
      'Elspeth Elva Elvera Elvie Elvina Elyse Elyssa Emely Emerald Emilee Emilyn Emmalee Emmie ' +
      'Emogene Enid Era Erlene Erlinda Eryn Essence Esta Ethelyn Evalyn Evangelina Evangeline Eve ' +
      'Evette Evie Fairy Fallon Farrah Fawn Fawna Felecia Felicity Felisha Fern Ferne Florene ' +
      'Florine Flossie Floy Fonda Fran Franchette Francie Freeda Freida Galilea Garnet Garnette ' +
      'Gaye Gayla Gaylen Gaylene Gaynell Gearldine Geena Gena Genelyn Genesis Genna Georgeann ' +
      'Georgene Georgetta Georgianna Georgie Georgina Georgine Geralyn Geri Gerianne Germaine ' +
      'Gerri Gertie Gerty Gia Gigi Gilda Gill Gillian Gilly Ginny Giselle Gisselle Glady Glinda ' +
      'Glynda Glynis Golda Goldie Graciela Grayce Gretta Griselda Gussie Gwendolen Gwyn Hadley ' +
      'Hailee Hailie Haleigh Hali Halie Halle Hallie Harmony Harriett Harriette Haven Haydee ' +
      'Haylee Haylie Heaven Hellen Herlinda Hester Hettie Holli Hollie Hortencia Idell Idella ' +
      'Iesha Ila Ilene Ima Imani Imogene India Inell Iola Iona Ione Isabell Isis Itzel Ivette ' +
      'Iyana Iyanna Jacalyn Jacey Jaci Jackeline Jacki Jacklyn Jacque Jacquelin Jacquelyne Jacqui ' +
      'Jacquie Jadyn Jaelyn Jaida Jaidyn Jailene Jailyn Jaimee Jaimie Jakayla Jaleesa Jalisa ' +
      'Jaliyah Jalyn Jalynn Jamya Janae Janalee Janay Jancee Janeen Janel Janell Janene Janessa ' +
      'Janey Janiya Janiyah Jann Janna Jannel Jannell Jannie Janyce Jaqueline Jasmyn Jaycee Jayda ' +
      'Jayde Jayla Jaylene Jaylyn Jaylynn Jaymie Jazlyn Jazmin Jazmine Jazmyn Jazmyne Jeana Jeane ' +
      'Jeanetta Jeanna Jen Jena Jenell Jenelle Jeni Jenica Jenice Jeniffer Jenn Jennell Jenney ' +
      'Jenni Jeraldine Jerilyn Jerrica Jerrie Jerrilyn Jessamyn Jessi Jessicah Jessika Jessye ' +
      'Jetta Jettie Jewell Jil Jillette Jilliane Jimena Jinny JoBeth JoEllen JoLynn Joanie ' +
      'Joannie Jocelyne Jodee Jodelle Jodine Joelle Joellyn Johnna Joleen Jolena Jolie Joline ' +
      'Jolynn Jona Jonell Jonelle Jonette Jonica Jonna Jonnie Jordyn Joseline Joselyn Joslyn ' +
      'Joycelyn Joye Judi Judie Julene Juli Juliann Julianna Juliet Julissa Justi Justina Kacey ' +
      'Kaci Kacie Kacy Kadee Kadence Kaela Kaelyn Kaia Kaila Kailee Kailey Kailyn Kaitlynn Kaiya ' +
      'Kaleigh Kaley Kali Kalie Kalin Kallie Kalyn Kami Kamilah Kamryn Kandace Kandi Kandice ' +
      'Kandy Karalyn Karan Karey Karie Karissa Karlee Karleen Karlene Karley Karli Karlie Karly ' +
      'Karlyn Karmyn Karol Karolyn Karon Karri Karrie Kary Karyn Kasandra Kassandra Kassidy ' +
      'Kassie Kat Katelin Katelynn Katey Kathaleen Katheryn Katheryne Kathey Kathi Kathlyn ' +
      'Kathrine Kathryne Kati Katina Katlin Katlyn Katlynn Kattie Katy Kaya Kaycee Kaydence Kaye ' +
      'Kaylah Kayleigh Kaylene Kayley Kayli Kaylie Kaylin Kaylyn Kaylynn Kecia Keela Keely Keira ' +
      'Kelsea Kelsi Kelsie Kendal Kendy Kenia Kenisha Kenna Kennedy Kenzie Kerrie Kesha Keshia ' +
      'Keyla Kia Kiana Kianna Kiera Kierra Kiersten Kiley Kimberlyn Kimbra Kinsey Kira Kirstie ' +
      'Kirstin Kisha Kitty Kizzy Kleo Koreen Kori Kortney Kourtney Krissy Kristal Kristan Kristyn ' +
      'Krysta Krysten Krystina Krystle Kya Kyla Kylee Kyleigh Kym Kymberly Kyra LaDeana LaShawn ' +
      'LaVerne LaVonne Laci Lacie Lacy Lakeisha Laken Lakesha Lakeshia Lakisha Lanette Laney ' +
      'Laquita Laraine Larissa Larue Lashanda Lashonda Latanya Latarsha Latonia Latosha Latrice ' +
      'Latricia Laureen Lauri Laurin Laurine Laury Lauryn Lavada Lavera Laverna Lavina Lavon ' +
      'Lawanda Layla LeAnn Leana Leanna Leatha Leatrice Leeann Leeanne Leesa Leighanne Leilani ' +
      'Leisa Lelia Lenore Leola Leone Leonore Leora Leota Lesa Lesia Leslee Lesli Lesly Lessie ' +
      'Leta Letha Letitia Lettie Letty Lexi Lexie Lexus Liane Lianna Lianne Libby Liberty Liddy ' +
      'Lilliana Lilly Lin Lindy Linette Linn Linnie Linsey Linzee LisaMarie Lisette Lisha ' +
      'Lissette Lita Litty Litzy Liza Lizabeth Lizbeth Lizeth Lizette Lizzie Lizzy Lolita Lona ' +
      'Loni Lonna Loraine Loreen Lorelei Loriann Lorilee Lorilei Lorinda Lorine Lorissa Lorri ' +
      'Lottie Louann Louella Louisa Louvenia Loveleen Lovie Loyce Lu LuAnn LuAnne Luana Lucile ' +
      'Lucretia Lue Luella Lulu Lura Lurline Luvenia Lyla Lyn Lynae Lynann Lyndi Lyndsay Lyndsey ' +
      'Lynelle Lynsey Lyric Macey Machelle Maci Macie Macy Madaline Madalyn Madalynn Maddison ' +
      'Madeleine Madelynn Madge Madie Madilyn Madisen Madisyn Madonna Madyson Maegan Magdeline ' +
      'Magen Magnolia Maira Makaila Makena Makenna Makenzie Maleah Malia Malissa Maliyah Mammie ' +
      'Mandi Maranda Mardell Marg Margarette Marge Margene Margery Mari Mariann Maribelle ' +
      'Maribeth Maricela Mariel Marietta Marilee Marilou Marilynn Marilynne Marisela Maritza ' +
      'Marjory Marlee Marleen Marlena Marley Marlo Marlyn Marlys Marni Marnie Marny Marquita ' +
      'Marti Marva Marvel MaryJo Maryanne Marybelle Marybeth Maryellen Maryjane Maryjo Marylee ' +
      'Marylin Marylou Marylyn Mathilda Maude Maudie Maura Maurine Mavis May Maybelle Mayme Mazie ' +
      'McKayla McKenna McKenzie Meadow Meaghan Mechelle Meghann Melany Mellisa Mellissa Melodee ' +
      'Melodie Melonie Melva Melvina Melynda Mendy Meredyth Merilee Merilyn Merlene Merna Merri ' +
      'Merrilee Merry Meryl Meta Miah Michell Mickie Migdalia Mikaela Mikayla Millicent Millie ' +
      'Mimi Mindi Minerva Miracle Mireya Missy Misti Mittie Mitzi Miya Montana Morgana Moriah ' +
      'Mozelle Mya Myah Myranda Myrle Myrtice Myrtie Myrtis Mysti Nadia Nakia Nakisha Nan Nancee ' +
      'Nanci Nancie Nannette Nannie Naoma Nardine Natalee Nataly Nayeli Nedra Nell Nelle Nessie ' +
      'Neva Nevaeh Neve Nia Nichelle Nichol Nicki Nicolette Nicolle Niki Nikia Nikita Nikky ' +
      'Nikole Nila Nita Noemi Nola Nona Norene Norine Nova Novella Nyah Nyasia Nydia Nyla Ocie ' +
      'Octavia Odessa Ola Oleta Olive Oma Ona Ophelia Oralia Orpha Ossie Pamala Pamella Pansy ' +
      'Patience Patrica Pauletta Pearle Pearlie Pearline Peggie Penni Pennie Perla Peta Phillis ' +
      'Philomena Phoebe Phylicia Phylis Pinkie Piper Portia Precious Presley Princess Prudence ' +
      'Queen Quiana Racheal Racquel Raegan Raelene Raina Randa Reagan Reanna Rebeca Regan Renae ' +
      'Renea Renita Reta Retha Reva Reyna Rhea Rhiannon Rhoda Richelle Rikki Rissa Robbin Romona ' +
      'Rona Ronette Ronna Rosalee Rosalinda Rosaline Rosamond Rosann Roseanne Rosella Roselle ' +
      'Roselyn Rosia Roslyn Rowena Roxane Roxann Roxanna Roxie Rozella Rubie Rubye Rutha Ruthann ' +
      'Ruthy Ryann Ryanne Rylee Ryleigh Rylie Sabra Sade Saige Salina Samara Sandi Sandie Saniya ' +
      'Santana Sarai Savanah Savanna Scarlett Selina Serenity Shaina Shakira Shalonda Shameka ' +
      'Shamika Shanda Shandy Shania Shanice Shanika Shaniqua Shanita Shaniya Shannah Shannan ' +
      'Shannen Shanon Shante Shantel Shantell Shantelle Shara Shareen Sharen Sharice Sharie ' +
      'Sharilyn Sharise Sharita Sharla Sharleen Sharlene Sharonda Sharri Sharyl Sharyn Shasta ' +
      'Shavon Shawnee Shaye Shayla Shaylee Shayna Sheela Sheena Shelba Shelbi Shelbie Shella ' +
      'Shelva Shere Sherie Sherilyn Sherita Sherlyn Sheron Sherrill Sherron Sherryl Shiela Shiloh ' +
      'Shirl Shirlee Shirlene Shonda Shonna Shoshana Shyann Shyanne Sienna Sigourney Sky Skye ' +
      'Skyla Sofi Sommer Spring Stacee Stacia Starla Stefani Steph Stephany Stormie Stormy Sudie ' +
      'SueAnn Suellen Sunny Sunshine Susanna Susannah Suzan Suzann Suzanna Suzi Suzie Suzy Sybil ' +
      'Syble Sydnee Sydni Sydnie Tahnee Takisha Talia Taliyah Tamala Tamatha Tameka Tamela Tamera ' +
      'Tamia Tamica Tamie Tamiko Tamra Tana Tanesha Tangela Tangie Tani Tanika Tarah Tarsha Taryn ' +
      'Tatum Tawana Tawanda Tawanna Tawnee Tawni Tawnya Taya Tayler Teagan Teena Telisa Temma ' +
      'Tena Tenisha Tennille Tera Terese Teressa Terra Tess Tessie Thalia Theda Theodora Tiana ' +
      'Tianna Tiara Tiera Tierra Tiffanie Tillie Tilly Tippi Tisha Tomeka Tomika Tonja Tonna ' +
      'Torri Torrie Tosha Toya Trena Tresa Tressa Tressie Treva Trish Trista Trixie Twila Twyla ' +
      'Tyesha Tyra Vada Valencia Valery Valorie Veda Velda Velva Velvet Venessa Venita Venus ' +
      'Verda Verdie Vergie Verity Verla Verlene Vernell Vernice Versie Vesta Vickey Viki Vikki ' +
      'Vina Virgie Viva Vonda Vonnie Waneta Wendee Wilda Willa Willene Willia Willow Windy Winnie ' +
      'Winnifred Winona Wynne Wynona Yadira Yareli Yasmine Yazmin Yessenia Yetta Yolonda Yoselin ' +
      'Zaria Zelda Zella Zelma Zina Zoey Zoie Zola Zona Zula',
  },
  unisex: {
    5:
      'Angel Jackie Jessie',
    4:
      'Casey Jaime Kerry Pat',
    3:
      'Aubrey Frankie Kendall Lou Paige Rene Robbie Summer',
    2:
      'Ashton Avery Blair Carey Kris Ollie Peyton Rusty Sammie Skyler Val',
    1:
      'Addison Alva Amari Andi Ardell Arian Armani Barrie Bevin Billee Blayne Bookem Brynn ' +
      'Campbell Carlon Carrol Ceri Charlye Corky Cydney Darby Devyn Jaiden Jammie Jaryn Jaylin ' +
      'Justice Kal Kayle Kennedi Kenyatta LaVern London Martie Paris Pauley Payton Phoenix Red ' +
      'Reese Reilly Robbi Rowan Sage Shea Shelli Shellie Sheridan Skylar Starr Sunni Tiffani ' +
      'Tippy Tully Vernie Wallie Wynn',
  },
}

// nam_dict.txt has no surnames; these are the most common U.S. surnames (2010 Census, top 100).
const LAST_NAMES = (
  'Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez Hernandez Lopez ' +
  'Gonzalez Wilson Anderson Thomas Taylor Moore Jackson Martin Lee Perez Thompson White Harris ' +
  'Sanchez Clark Ramirez Lewis Robinson Walker Young Allen King Wright Scott Torres Nguyen Hill ' +
  'Flores Green Adams Nelson Baker Hall Rivera Campbell Mitchell Carter Roberts Gomez Phillips ' +
  'Evans Turner Diaz Parker Cruz Edwards Collins Reyes Stewart Morris Morales Murphy Cook Rogers ' +
  'Gutierrez Ortiz Morgan Cooper Peterson Bailey Reed Kelly Howard Ramos Kim Cox Ward Richardson ' +
  'Watson Brooks Chavez Wood James Bennett Gray Mendoza Ruiz Hughes Price Alvarez Castillo ' +
  'Sanders Patel Myers Long Ross Foster Jimenez'
).split(' ')

type Gender = 'male' | 'female' | 'unisex'
type Pool = { names: string[]; gender: Gender[]; cumWeight: number[]; total: number }

// Build a weighted pool; weight = 2^(freq-1) so picks follow real-world popularity.
function buildPool(genders: Gender[]): Pool {
  const pool: Pool = { names: [], gender: [], cumWeight: [], total: 0 }
  for (const g of genders) {
    for (const [freq, list] of Object.entries(FIRST_NAMES[g])) {
      const weight = 2 ** (Number(freq) - 1)
      for (const name of list.split(' ')) {
        pool.total += weight
        pool.names.push(name)
        pool.gender.push(g)
        pool.cumWeight.push(pool.total)
      }
    }
  }
  return pool
}

const POOLS = {
  male: buildPool(['male', 'unisex']),
  female: buildPool(['female', 'unisex']),
  any: buildPool(['male', 'female', 'unisex']),
}

function pickWeighted(pool: Pool): number {
  const r = Math.random() * pool.total
  let lo = 0
  let hi = pool.cumWeight.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (pool.cumWeight[mid] > r) hi = mid
    else lo = mid + 1
  }
  return lo
}

export function randomName(gender: keyof typeof POOLS = 'any') {
  const pool = POOLS[gender]
  const i = pickWeighted(pool)
  // Middle name comes from the first name's gender pool, so it matches; reroll if it repeats the first name
  const middlePool = POOLS[pool.gender[i] === 'unisex' ? gender : pool.gender[i]]
  let m = pickWeighted(middlePool)
  while (middlePool.names[m] === pool.names[i]) m = pickWeighted(middlePool)
  return {
    firstName: pool.names[i],
    middleName: middlePool.names[m],
    lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
    gender: pool.gender[i],
  }
}

interface RandomNamesQuery {
  count?: number
  gender?: keyof typeof POOLS
}

export async function nameRoutes(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate)

  server.get<{ Querystring: RandomNamesQuery }>('/names/random', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          count: { type: 'integer', minimum: 1, maximum: 1000, default: 1 },
          gender: { type: 'string', enum: ['male', 'female', 'any'], default: 'any' },
        },
      },
    },
  }, async (request) => {
    const { count = 1, gender = 'any' } = request.query
    return randomName(gender)
  })
}
