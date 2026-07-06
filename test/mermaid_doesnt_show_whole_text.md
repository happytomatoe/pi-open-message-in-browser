 Here is a diagram showing the current workflow of the visual regression tests in packages/mdopen/scripts/visual-test.ts:

 ```mermaid
   graph TD
       Start([Start Tests]) --> Setup[Setup Paths & Temp Dir]
       Setup --> WriteMD[Write TEST_MARKDOWN to tmp file]

       subgraph Phase1 [Phase 1: HTML Generation]
           WriteMD --> BatchGen[Process Themes in Batches]
           BatchGen --> RunCLI[Run mdopen CLI per theme]
           RunCLI --> SaveHTML[Save theme-specific HTML]
           SaveHTML --> BatchGen
       end

       BatchGen --> LaunchBrowser[Launch Puppeteer Browser]

       subgraph Phase2 [Phase 2: Visual Verification]
           LaunchBrowser --> BatchScreen[Process Themes in Batches]
           BatchScreen --> OpenPage[Open HTML in Browser]
           OpenPage --> Wait[Wait for Network Idle + 1.5s]
           Wait --> Screenshot[Take Full Page Screenshot]

           Screenshot --> CheckUpdate{Update Baselines?}
           CheckUpdate -- Yes --> SaveBaseline[Save as Baseline PNG]
           CheckUpdate -- No --> LoadBaseline[Load Baseline PNG]

           LoadBaseline --> PixelDiff[Calculate Pixel Difference]
           PixelDiff --> Compare{Diff < 0.5%?}
           Compare -- Yes --> Pass[Mark as Passed]
           Compare -- No --> Fail[Mark as Failed]

           SaveBaseline --> BatchScreen
           Pass --> BatchScreen
           Fail --> BatchScreen
       end

       BatchScreen --> Summary[Aggregate Results]
       Summary --> Exit([Exit with Status])
 ```
