var documenterSearchIndex = {"docs": [

{
    "location": "#",
    "page": "Home",
    "title": "Home",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "#SDDP.jl-1",
    "page": "Home",
    "title": "SDDP.jl",
    "category": "section",
    "text": "warn: Warn\nSDDP.jl under went a major re-write to be compatible with JuMP v0.19 and Julia v1.0. The Upgrading guide has advice on how to upgrade your existing SDDP.jl models.SDDP.jl is a package for solving large multistage convex stochastic programming problems using stochastic dual dynamic programming. In this manual, we\'re going to assume a reasonable amount of background knowledge about stochastic optimization, the SDDP algorithm, Julia, and JuMP.info: Info\nIf you haven\'t used JuMP before, we recommend that you read the JuMP documentation and try building and solving JuMP models before trying SDDP.jl."
},

{
    "location": "#Installation-1",
    "page": "Home",
    "title": "Installation",
    "category": "section",
    "text": "You can install SDDP.jl as follows:import Pkg\nPkg.add(\"https://github.com/odow/SDDP.jl.git\")If you get an error like: ERROR: Unsatisfiable requirements detected for package MathOptFormat, runimport Pkg\nPkg.add(\"https://github.com/odow/MathOptFormat.jl.git\")\nPkg.add(\"https://github.com/odow/SDDP.jl.git\")"
},

{
    "location": "#Want-the-old-version?-1",
    "page": "Home",
    "title": "Want the old version?",
    "category": "section",
    "text": "Still using Julia 0.6 and things broke when you went Pkg.update()? Runjulia> Pkg.checkout(\"SDDP\", \"release-v0\")"
},

{
    "location": "#Tutorials-1",
    "page": "Home",
    "title": "Tutorials",
    "category": "section",
    "text": "Once you\'ve got SDDP.jl installed, you should read some tutorials, beginning with Basic I: first steps."
},

{
    "location": "#Citing-SDDP.jl-1",
    "page": "Home",
    "title": "Citing SDDP.jl",
    "category": "section",
    "text": "If you use SDDP.jl, we ask that you please cite the following paper:@article{dowson_sddp.jl,\n	title = {{SDDP}.jl: a {Julia} package for stochastic dual dynamic programming},\n	url = {http://www.optimization-online.org/DB_HTML/2017/12/6388.html},\n	journal = {Optimization Online},\n	author = {Dowson, Oscar and Kapelevich, Lea},\n	year = {2017}\n}If you use the infinite horizon functionality, we ask that you please cite the following paper:@article{dowson_policy_graph,\n	title = {The policy graph decomposition of multistage stochastic\n      optimization problems},\n	url = {http://www.optimization-online.org/DB_HTML/2018/11/6914.html},\n	journal = {Optimization Online},\n	author = {Dowson, Oscar},\n	year = {2018}\n}"
},

{
    "location": "upgrading_guide/#",
    "page": "Upgrading guide",
    "title": "Upgrading guide",
    "category": "page",
    "text": ""
},

{
    "location": "upgrading_guide/#Upgrading-guide-1",
    "page": "Upgrading guide",
    "title": "Upgrading guide",
    "category": "section",
    "text": "SDDP.jl under went a major re-write to be compatible with JuMP v0.19 and Julia v1.0.Some of the highlights of the new release includeSupport for \"multi-cut\"s\nSupport for stagewise-independent noise in the constraint matrix\nA way to simulate out-of-sample realizations of the stagewise-independent noise terms\nExtensible ways to get information such as dual variables out of a simulation\nSupport for infinite horizon multistage stochastic programs\nExtensible stopping rules\nExtensible sampling schemes\nImproved cut selection routines\nBetter checks for numerical issues\nA much tidier (and simpler) implementation, with ample commenting throughout the code base"
},

{
    "location": "upgrading_guide/#Syntax-changes-1",
    "page": "Upgrading guide",
    "title": "Syntax changes",
    "category": "section",
    "text": "The complete re-write has resulted in a painful upgrading process as users must simultaneously upgrade from Julia 0.6 to Julia 1.0, from JuMP 0.18 to JuMP 0.19, and from the old syntax of SDDP.jl to the new. In this section, we outline some of the larger changes. For more information, we recommend reading the updated tutorials, beginning with Basic I: first steps"
},

{
    "location": "upgrading_guide/#SDDPModel-1",
    "page": "Upgrading guide",
    "title": "SDDPModel",
    "category": "section",
    "text": "SDDPModel has been replaced in favor of a more general approach to formulating multistage stochastic optimization problems.For basic use-cases, SDDPModel has been replaced by LinearPolicyGraph.model = SDDPModel(stages = 3) do subproblem, t\n    # subproblem definition.\nend\n\n# becomes\n\nmodel = SDDP.LinearPolicyGraph(stages = 3) do subproblem, t\n    # subproblem definition.\nendIf you used the markov_transition feature, SDDPModel has been replaced by MarkovianPolicyGraph.model = SDDPModel(\n      markov_transition = Array{Float64, 2}[\n          [ 1.0 ]\',\n          [ 0.75 0.25 ],\n          [ 0.75 0.25 ; 0.25 0.75 ]\n      ]) do subproblem, t, i\n  # subproblem definition.\nend\n\n# becomes\n\nmodel = SDDP.MarkovianPolicyGraph(\n        transition_matrices = Array{Float64, 2}[\n            [ 1.0 ]\',\n            [ 0.75 0.25 ],\n            [ 0.75 0.25 ; 0.25 0.75 ]\n        ]) do subproblem, node\n    t, i = node\n    # subproblem definition.\nend"
},

{
    "location": "upgrading_guide/#solver-1",
    "page": "Upgrading guide",
    "title": "solver =",
    "category": "section",
    "text": "JuMP 0.19 changed the way that solvers are passed to JuMP models.SDDPModel(solver = GurobiSolver(OutputFlag = 0))\n\n# becomes\n\nLinearPolicyGraph(optimizer = with_optimizer(Gurobi.Optimizer, OutputFlag = 0))"
},

{
    "location": "upgrading_guide/#@state-1",
    "page": "Upgrading guide",
    "title": "@state",
    "category": "section",
    "text": "We changed how to specify state variables.@state(subproblem, 0 <= x <= 1, x0==2)\n\n# becomes\n\n@variable(subproblem, 0 <= x <= 1, SDDP.State, initial_value = 2)In addition, instead of having to create an incoming state x0 and an outgoing state x, we now refer to x.in and x.out. Here is another example:@state(subproblem, 0 <= x[i=1:2] <= 1, x0==i)\n\n# becomes\n\n@variable(subproblem, 0 <= x[i=1:2] <= 1, SDDP.State, initial_value = i)\n\nx0[1]\n\n# becomes\n\nx[1].in\n\nx[2]\n\n# becomes\n\nx[2].out"
},

{
    "location": "upgrading_guide/#@rhsnoise-1",
    "page": "Upgrading guide",
    "title": "@rhsnoise",
    "category": "section",
    "text": "We removed @rhsnoise. This results in more lines of code, but more flexibility.@rhsnoise(subproblem, ω = [1, 2, 3], 2x <= ω)\nsetnoiseprobability!(subproblem, [0.5, 0.2, 0.3])\n\n# becomes\n\n@variable(subproblem, ω)\n@constraint(subproblem, 2x <= ω)\nSDDP.parameterize(subproblem, [1, 2, 3], [0.5, 0.2, 0.3]) do ϕ\n    JuMP.fix(ω, ϕ)\nend"
},

{
    "location": "upgrading_guide/#@stageobjective-1",
    "page": "Upgrading guide",
    "title": "@stageobjective",
    "category": "section",
    "text": "@stageobjective no longer accepts a random list of parameters. Use SDDP.parameterize instead.@stageobjective(subproblem, ω = [1, 2, 3], ω * x)\nsetnoiseprobability!(subproblem, [0.5, 0.2, 0.3])\n\n# becomes\n\nSDDP.parameterize(subproblem, [1, 2, 3], [0.5, 0.2, 0.3]) do ω\n    @stageobjective(subproblem, ω * x)\nend"
},

{
    "location": "upgrading_guide/#SDDP.solve-1",
    "page": "Upgrading guide",
    "title": "SDDP.solve",
    "category": "section",
    "text": "SDDP.solve has been replaced by SDDP.train. See the docs for a complete list of the new options as most things have changed.note: Note\nParallel training has not (yet) been implemented."
},

{
    "location": "upgrading_guide/#Plotting-1",
    "page": "Upgrading guide",
    "title": "Plotting",
    "category": "section",
    "text": "Much of the syntax for plotting has changed. See Basic V: plotting for the new syntax."
},

{
    "location": "upgrading_guide/#Price-interpolation-1",
    "page": "Upgrading guide",
    "title": "Price interpolation",
    "category": "section",
    "text": "The syntax for models with stagewise-dependent objective processes has completely changed. See Intermediate IV: objective states for details."
},

{
    "location": "tutorial/01_first_steps/#",
    "page": "Basic I: first steps",
    "title": "Basic I: first steps",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "tutorial/01_first_steps/#Basic-I:-first-steps-1",
    "page": "Basic I: first steps",
    "title": "Basic I: first steps",
    "category": "section",
    "text": "Hydrothermal scheduling is the most common application of stochastic dual dynamic programming. To illustrate some of the basic functionality of SDDP.jl, we implement a very simple model of the hydrothermal scheduling problem.We consider the problem of scheduling electrical generation over three time periods in order to meet a known demand of 150 MWh in each period.There are two generators: a thermal generator, and a hydro generator. The thermal generator has a short-run marginal cost of \\$50/MWh in the first stage, \\$100/MWh in the second stage, and \\$150/MWh in the third stage. The hydro generator has a short-run marginal cost of \\$0/MWh.The hydro generator draws water from a reservoir which has a maximum capacity of 200 units. We assume that at the start of the first time period, the reservoir is full. In addition to the ability to generate electricity by passing water through the hydroelectric turbine, the hydro generator can also spill water down a spillway (bypassing the turbine) in order to prevent the water from over-topping the dam. We assume that there is no cost of spillage.The objective of the optimization is to minimize the expected cost of generation over the three time periods."
},

{
    "location": "tutorial/01_first_steps/#Mathematical-formulation-1",
    "page": "Basic I: first steps",
    "title": "Mathematical formulation",
    "category": "section",
    "text": "Let\'s take the problem described above and form a mathematical model. In any multistage stochastic programming problem, we need to identify five key features:The stages\nThe state variables\nThe control variables\nThe dynamics\nThe stage-objective"
},

{
    "location": "tutorial/01_first_steps/#Stages-1",
    "page": "Basic I: first steps",
    "title": "Stages",
    "category": "section",
    "text": "We consider the problem of scheduling electrical generation over three timeperiodsSo, we have three stages: t = 1, 2, 3. Here is a picture:(Image: Linear policy graph)Notice that the boxes form a linear graph. This will be important when we get to the code. (We\'ll get to more complicated graphs in future tutorials.)"
},

{
    "location": "tutorial/01_first_steps/#State-variables-1",
    "page": "Basic I: first steps",
    "title": "State variables",
    "category": "section",
    "text": "State variables capture the information that flows between stages. These can be harder to identify. However, in our model, the state variable is the volume of water stored in the reservoir over time.In the model below, we\'re going to call the state variable volume.Each stage t is an interval in time. Thus, we need to record the value of the state variable in each stage at two points in time: at the beginning of the stage, which we  refer to as the incoming value of the state variable; and at the end of the  state, which we refer to as the outgoing state variable.We\'re going to refer to the incoming value of volume by volume.in and the outgoing value by volume.out.Note that volume.out when t=1 is equal to volume.in when t=2.The problem description also mentions some constraints on the volume of water in the reservoir. It cannot be negative, and the maximum level is 200 units. Thus, we have 0 <= volume <= 200. Also, the description says that the initial value of water in the reservoir (i.e., volume.in when t = 1) is 200."
},

{
    "location": "tutorial/01_first_steps/#Control-variables-1",
    "page": "Basic I: first steps",
    "title": "Control variables",
    "category": "section",
    "text": "Control variables are the actions that the agent can take during a stage to change the value of the state variables. (Hence the name control.)There are three control variables in our problem.The quantity of thermal generation, which we\'re going to call thermal_generation.\nThe quantity of hydro generation, which we\'re going to call hydro_generation.\nThe quatity of water to spill, which we\'re going to call hydro_spill.All of these variables are non-negative."
},

{
    "location": "tutorial/01_first_steps/#The-dynamics-1",
    "page": "Basic I: first steps",
    "title": "The dynamics",
    "category": "section",
    "text": "The dynamics of a problem describe how the state variables evolve through time in response to the controls chosen by the agent.For our problem, the state variable is the volume of water in the reservoir. The volume of water decreases in response to water being used for hydro generation and spillage. So the dynamics for our problem are:volume.out = volume.in - hydro_generation - hydro_spillWe can also put constraints on the values of the state and control variables. For example, in our problem, there is also a constraint that the total generation must meet the demand of 150 MWh in each stage. So, we have a constraint that: hydro_generation + thermal_generation = 150."
},

{
    "location": "tutorial/01_first_steps/#The-stage-objective-1",
    "page": "Basic I: first steps",
    "title": "The stage-objective",
    "category": "section",
    "text": "The agent\'s objective is to minimize the cost of generation. So in each stage, the agent wants to minimize the quantity of thermal generation multiplied by the short-run marginal cost of thermal generation.In stage t, they want to minimize fuel_cost[t] * thermal_generation, where fuel_cost[t] is \\$50 when t=1, \\$100 when t=2, and \\$150 when t=3.We\'re now ready to construct a model. Since SDDP.jl is intended to be very user-friendly, we\'re going to give the full code first, and then walk through some of the details. However, you should be able to read through and understand most of what is happening."
},

{
    "location": "tutorial/01_first_steps/#Creating-a-model-1",
    "page": "Basic I: first steps",
    "title": "Creating a model",
    "category": "section",
    "text": "using SDDP, GLPK\n\nmodel = SDDP.LinearPolicyGraph(\n            stages = 3,\n            sense = :Min,\n            lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, t\n    # Define the state variable.\n    @variable(subproblem, 0 <= volume <= 200, SDDP.State, initial_value = 200)\n    # Define the control variables.\n    @variables(subproblem, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n    end)\n    # Define the constraints\n    @constraints(subproblem, begin\n        volume.out == volume.in - hydro_generation - hydro_spill\n        thermal_generation + hydro_generation == 150.0\n    end)\n    # Define the objective for each stage `t`. Note that we can use `t` as an\n    # index for t = 1, 2, 3.\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(subproblem, fuel_cost[t] * thermal_generation)\nend\n\n# output\n\nA policy graph with 3 nodes.\n Node indices: 1, 2, 3Wasn\'t that easy! Let\'s walk through some of the non-obvious features.info: Info\nFor more information on SDDP.LinearPolicyGraphs, read Intermediate III: policy graphs."
},

{
    "location": "tutorial/01_first_steps/#The-keywords-in-the-[SDDP.LinearPolicyGraph](@ref)-constructor-1",
    "page": "Basic I: first steps",
    "title": "The keywords in the SDDP.LinearPolicyGraph constructor",
    "category": "section",
    "text": "Hopefully stages and sense are obvious. However, the other two are not so clear.lower_bound: you must supply a valid bound on the objective. For our problem, we know that we cannot incur a negative cost so \\$0 is a valid lower bound.optimizer: This is borrowed directly from JuMP\'s Model constructor:using JuMP\nmodel = Model(with_optimizer(GLPK.Optimizer))"
},

{
    "location": "tutorial/01_first_steps/#Creating-state-variables-1",
    "page": "Basic I: first steps",
    "title": "Creating state variables",
    "category": "section",
    "text": "State variables can be created like any other JuMP variables. Think of them as another type of variable like binary or integer. For example, to create a binary variable in JuMP, you go:@variable(subproblem, x, Bin)whereas to create a state variable you go@variable(subproblem, x, SDDP.State)Also note that you have to pass a keyword argument called initial_value that gives the incoming value of the state variable in the first stage."
},

{
    "location": "tutorial/01_first_steps/#Defining-the-stage-objective-1",
    "page": "Basic I: first steps",
    "title": "Defining the stage-objective",
    "category": "section",
    "text": "In a JuMP model, we can set the objective using @objective. For example:@objective(subproblem, Min, fuel_cost[t] * thermal_generation)Since we only need to define the objective for each stage, rather than the whole problem, we use the SDDP.jl-provided @stageobjective.@stageobjective(subproblem, fuel_cost[t] * thermal_generation)Note that we don\'t have to specify the optimization sense (Max of Min) since this is done via the sense keyword argument of SDDP.LinearPolicyGraph."
},

{
    "location": "tutorial/01_first_steps/#Training-a-policy-1",
    "page": "Basic I: first steps",
    "title": "Training a policy",
    "category": "section",
    "text": "Models can be trained using the SDDP.train function. It accepts a number of keyword arguments. iteration_limit terminates the training after the provided number of iterations.julia> SDDP.train(model; iteration_limit = 3)\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\nNumerical stability report\n  Non-zero Matrix range     [1e+00, 1e+00]\n  Non-zero Objective range  [1e+00, 2e+02]\n  Non-zero Bounds range     [2e+02, 2e+02]\n  Non-zero RHS range        [2e+02, 2e+02]\nNo problems detected\n\n Iteration    Simulation       Bound         Time (s)\n        1    3.250000e+04   1.500000e+04   3.099990e-02\n        2    1.750000e+04   1.750000e+04   3.099990e-02\n        3    1.750000e+04   1.750000e+04   3.199983e-02\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------info: Info\nFor more information on the numerical stability report, read the Numerical stability report section."
},

{
    "location": "tutorial/01_first_steps/#Simulating-the-policy-1",
    "page": "Basic I: first steps",
    "title": "Simulating the policy",
    "category": "section",
    "text": "Once you have a trained policy, you can simulate it using SDDP.simulate. The return value from simulate is a vector with one element for each replication. Each element is itself a vector, with one element for each stage. Each element, corresponding to a particular stage in a particular replication, is a dictionary that records information from the simulation.simulations = SDDP.simulate(\n    # The trained model to simulate.\n    model,\n    # The number of replications.\n    1,\n    # A list of names to record the values of.\n    [:volume, :thermal_generation, :hydro_generation, :hydro_spill]\n)\n\nreplication = 1\nstage = 2\nsimulations[replication][stage]\n\n# output\n\nDict{Symbol,Any} with 9 entries:\n  :volume             => State{Float64}(200.0, 150.0)\n  :hydro_spill        => 0.0\n  :bellman_term       => 0.0\n  :noise_term         => nothing\n  :node_index         => 2\n  :stage_objective    => 10000.0\n  :objective_state    => nothing\n  :thermal_generation => 100.0\n  :hydro_generation   => 50.0Ignore many of the entries for now. They will be relevant later. Of interest is :volume and :thermal_generation.julia> outgoing_volume = [stage[:volume].out for stage in simulations[1]]\n3-element Array{Float64,1}:\n 200.0\n 150.0\n   0.0\n\njulia> thermal_generation = [stage[:thermal_generation] for stage in simulations[1]]\n3-element Array{Float64,1}:\n 150.0\n 100.0\n   0.0From this, we can see the optimal policy: in the first stage, use 150 MWh of thermal generation and 0 MWh of hydro generation. In the second stage, use 100 MWh of thermal and 50 MWh of hydro. In the third and final stage, use 0 MWh of thermal and 150 MWh of  hydro.This concludes our first very simple tutorial for SDDP.jl. In the next tutorial, Basic II: adding uncertainty, we will extend this problem by adding uncertainty."
},

{
    "location": "tutorial/02_adding_uncertainty/#",
    "page": "Basic II: adding uncertainty",
    "title": "Basic II: adding uncertainty",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "tutorial/02_adding_uncertainty/#Basic-II:-adding-uncertainty-1",
    "page": "Basic II: adding uncertainty",
    "title": "Basic II: adding uncertainty",
    "category": "section",
    "text": "In the previous tutorial, Basic I: first steps, we created a deterministic  hydro-thermal scheduling model. In this tutorial, we extend the problem by adding uncertainty.Notably missing from our previous model were inflows. Inflows are the water that flows into the reservoir through rainfall or rivers. These inflows are uncertain, and are the cause of the main trade-off in hydro-thermal scheduling: the desire to use water now to generate cheap electricity, against the risk that future inflows will be low, leading to blackouts or expensive thermal generation.For our simple model, we assume that the inflows can be modelled by a discrete distribution with the three outcomes given in the following table:ω 0 50 100\nP(ω) 1/3 1/3 1/3The value of the noise (the random variable) is observed by the agent at the start of each stage. This makes the problem a wait-and-see or hazard-decision formulation.To represent this, we can draw the following picture. The wavy lines denote the uncertainty arriving into the start of each stage (node).(Image: Linear policy graph)In addition to adding this uncertainty to the model, we also need to modify the dynamics to include inflow:volume.out = volume.in + inflow - hydro_generation - hydro_spill"
},

{
    "location": "tutorial/02_adding_uncertainty/#Creating-a-model-1",
    "page": "Basic II: adding uncertainty",
    "title": "Creating a model",
    "category": "section",
    "text": "To add an uncertain variable to the model, we create a new JuMP variable inflow, and then call the function SDDP.parameterize. The SDDP.parameterize function takes three arguments: the subproblem, a vector of realizations, and a corresponding vector of probabilities.using SDDP, GLPK\n\nmodel = SDDP.LinearPolicyGraph(\n            stages = 3,\n            sense = :Min,\n            lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, t\n    # Define the state variable.\n    @variable(subproblem, 0 <= volume <= 200, SDDP.State, initial_value = 200)\n    # Define the control variables.\n    @variables(subproblem, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n        inflow\n    end)\n    # Define the constraints\n    @constraints(subproblem, begin\n        volume.out == volume.in + inflow - hydro_generation - hydro_spill\n        demand_constraint, thermal_generation + hydro_generation == 150.0\n    end)\n    # Define the objective for each stage `t`. Note that we can use `t` as an\n    # index for t = 1, 2, 3.\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(subproblem, fuel_cost[t] * thermal_generation)\n    # Parameterize the subproblem.\n    SDDP.parameterize(subproblem, [0.0, 50.0, 100.0], [1/3, 1/3, 1/3]) do ω\n        JuMP.fix(inflow, ω)\n    end\nend\n\n# output\n\nA policy graph with 3 nodes.\n Node indices: 1, 2, 3Note how we use the JuMP function JuMP.fix to set the value of the inflow variable to ω.note: Note\nSDDP.parameterize can only be called once in each subproblem definition!"
},

{
    "location": "tutorial/02_adding_uncertainty/#Training-and-simulating-the-policy-1",
    "page": "Basic II: adding uncertainty",
    "title": "Training and simulating the policy",
    "category": "section",
    "text": "As in Basic I: first steps, we train the policy:julia> SDDP.train(model; iteration_limit = 10)\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\nNumerical stability report\n  Non-zero Matrix range     [1e+00, 1e+00]\n  Non-zero Objective range  [1e+00, 2e+02]\n  Non-zero Bounds range     [2e+02, 2e+02]\n  Non-zero RHS range        [2e+02, 2e+02]\nNo problems detected\n\n Iteration    Simulation       Bound         Time (s)\n        1    1.750000e+04   3.437500e+03   5.721000e+00\n        2    1.093750e+04   7.500000e+03   6.552000e+00\n        3    1.000000e+04   8.333333e+03   6.553000e+00\n        4    1.250000e+04   8.333333e+03   6.554000e+00\n        5    2.500000e+03   8.333333e+03   6.554000e+00\n        6    5.000000e+03   8.333333e+03   6.555000e+00\n        7    1.500000e+04   8.333333e+03   6.556000e+00\n        8    1.250000e+04   8.333333e+03   6.557000e+00\n        9    5.000000e+03   8.333333e+03   6.558000e+00\n       10    1.250000e+04   8.333333e+03   6.558000e+00\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------note: Note\nSince SDDP is a stochastic algorithm, you might get slightly different numerical results.We can also simulate the policy. Note that this time, the simulation is stochastic. One common approach to quantify the quality of the policy is to perform  a Monte Carlo simulation and then form a confidence interval for the expected cost. This confidence interval is an estimate for the upper bound.In addition to the confidence interval, we can calculate the lower bound using SDDP.calculate_bound.julia> simulations = SDDP.simulate(model, 500);\n\njulia> objective_values = [\n           sum(stage[:stage_objective] for stage in sim) for sim in simulations\n       ];\n\njulia> using Statistics\n\njulia> μ = round(mean(objective_values), digits = 2);\n\njulia> ci = round(1.96 * std(objective_values) / sqrt(500), digits = 2);\n\njulia> println(\"Confidence interval: \", μ, \" ± \", ci)\nConfidence interval: 8400.00 ± 409.34\n\njulia> println(\"Lower bound: \", round(SDDP.calculate_bound(model), digits = 2))\nLower bound: 8333.33In addition to simulating the primal values of variables, we can also pass SDDP.jl custom recorder functions. Each of these functions takes one argument, the JuMP subproblem, and returns anything you can compute. For example, the dual of the demand constraint (which we named demand_constraint) corresponds to the price we should charge for electricity, since it represents the cost of each additional unit of demand. To calculate this, we can gojulia> simulations = SDDP.simulate(\n           model,\n           1,\n           custom_recorders = Dict{Symbol, Function}(\n               :price => (sp) -> JuMP.dual(sp[:demand_constraint])\n           )\n       );\n\njulia> [stage[:price] for stage in simulations[1]]\n3-element Array{Float64,1}:\n  50.0\n 100.0\n  -0.0This concludes our second tutorial for SDDP.jl. In the next tutorial, Basic III: objective uncertainty, we extend the uncertainty to the fuel cost."
},

{
    "location": "tutorial/03_objective_uncertainty/#",
    "page": "Basic III: objective uncertainty",
    "title": "Basic III: objective uncertainty",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "tutorial/03_objective_uncertainty/#Basic-III:-objective-uncertainty-1",
    "page": "Basic III: objective uncertainty",
    "title": "Basic III: objective uncertainty",
    "category": "section",
    "text": "In the previous tutorial, Basic II: adding uncertainty, we created a stochastic hydro-thermal scheduling model. In this tutorial, we extend the problem by adding uncertainty to the fuel costs.Previously, we assumed that the fuel cost was deterministic: \\$50/MWh in the first stage, \\$100/MWh in the second stage, and \\$150/MWh in the third stage. For this tutorial, we assume that in addition to these base costs, the actual fuel cost is correlated with the inflows.Our new model for the uncertinty is given by the following table:ω 1 2 3\nP(ω) 1/3 1/3 1/3\ninflow 0 50 100\nfuel_multiplier 1.5 1.0 0.75In stage t, the objective is not to minimizefuel_multiplier * fuel_cost[t] * thermal_generation"
},

{
    "location": "tutorial/03_objective_uncertainty/#Creating-a-model-1",
    "page": "Basic III: objective uncertainty",
    "title": "Creating a model",
    "category": "section",
    "text": "To add an uncertain objective, we can simply call @stageobjective from inside the SDDP.parameterize function.using SDDP, GLPK\n\nmodel = SDDP.LinearPolicyGraph(\n            stages = 3,\n            sense = :Min,\n            lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, t\n    # Define the state variable.\n    @variable(subproblem, 0 <= volume <= 200, SDDP.State, initial_value = 200)\n    # Define the control variables.\n    @variables(subproblem, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n        inflow\n    end)\n    # Define the constraints\n    @constraints(subproblem, begin\n        volume.out == volume.in + inflow - hydro_generation - hydro_spill\n        thermal_generation + hydro_generation == 150.0\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    # Parameterize the subproblem.\n    Ω = [\n        (inflow = 0.0, fuel_multiplier = 1.5),\n        (inflow = 50.0, fuel_multiplier = 1.0),\n        (inflow = 100.0, fuel_multiplier = 0.75)\n    ]\n    SDDP.parameterize(subproblem, Ω, [1/3, 1/3, 1/3]) do ω\n        JuMP.fix(inflow, ω.inflow)\n        @stageobjective(subproblem,\n            ω.fuel_multiplier * fuel_cost[t] * thermal_generation)\n    end\nend\n\n# output\n\nA policy graph with 3 nodes.\n Node indices: 1, 2, 3"
},

{
    "location": "tutorial/03_objective_uncertainty/#Training-and-simulating-the-policy-1",
    "page": "Basic III: objective uncertainty",
    "title": "Training and simulating the policy",
    "category": "section",
    "text": "As in the previous two tutorials, we train the policy:SDDP.train(model; iteration_limit = 10)\n\nsimulations = SDDP.simulate(model, 500)\n\nobjective_values = [\n    sum(stage[:stage_objective] for stage in sim) for sim in simulations\n]\n\nusing Statistics\n\nμ = round(mean(objective_values), digits = 2)\nci = round(1.96 * std(objective_values) / sqrt(500), digits = 2)\n\nprintln(\"Confidence interval: \", μ, \" ± \", ci)\nprintln(\"Lower bound: \", round(SDDP.calculate_bound(model), digits = 2))\n\n# output\n\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\nNumerical stability report\n  Non-zero Matrix range     [1e+00, 1e+00]\n  Non-zero Objective range  [1e+00, 2e+02]\n  Non-zero Bounds range     [2e+02, 2e+02]\n  Non-zero RHS range        [2e+02, 2e+02]\nNo problems detected\n\n Iteration    Simulation       Bound         Time (s)\n        1    2.250000e+04   8.173077e+03   3.500009e-02\n        2    2.105769e+04   1.050595e+04   3.600001e-02\n        3    1.875000e+03   1.050595e+04   3.699994e-02\n        4    5.000000e+03   1.062500e+04   6.599998e-02\n        5    5.000000e+03   1.062500e+04   6.699991e-02\n        6    1.125000e+04   1.062500e+04   6.800008e-02\n        7    1.312500e+04   1.062500e+04   6.900001e-02\n        8    1.125000e+04   1.062500e+04   7.999992e-02\n        9    3.375000e+04   1.062500e+04   8.100009e-02\n       10    1.250000e+04   1.062500e+04   8.200002e-02\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------\nConfidence interval: 10388.75 ± 753.61\nLower bound: 10625.0This concludes our third tutorial for SDDP.jl. In the next tutorial, Basic IV: Markov uncertainty, we add stagewise-dependence to the inflows using a Markov chain."
},

{
    "location": "tutorial/04_markov_uncertainty/#",
    "page": "Basic IV: Markov uncertainty",
    "title": "Basic IV: Markov uncertainty",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "tutorial/04_markov_uncertainty/#Basic-IV:-Markov-uncertainty-1",
    "page": "Basic IV: Markov uncertainty",
    "title": "Basic IV: Markov uncertainty",
    "category": "section",
    "text": "In our three tutorials (Basic I: first steps, Basic II: adding uncertainty, and Basic III: objective uncertainty), we formulated a simple hydrothermal scheduling problem with stagewise-independent noise in the right-hand side of the constraints and in the objective function. Now, in this tutorial, we introduce some stagewise-dependent uncertainty using a Markov chain."
},

{
    "location": "tutorial/04_markov_uncertainty/#Formulating-the-problem-1",
    "page": "Basic IV: Markov uncertainty",
    "title": "Formulating the problem",
    "category": "section",
    "text": "In this tutorial we consider a Markov chain with two climate states: wet and dry. Each Markov state is associated with an integer, in this case the wet climate state  is Markov state 1 and the dry climate state is Markov state 2. In the wet climate state, the probability of the high inflow increases to 50%, and the probability of the low inflow decreases to 1/6. In the dry climate state, the converse happens. There is also persistence in the climate state: the probability of remaining in the current state is 75%, and the probability of transitioning to the other climate state is 25%. We assume that the first stage starts in the wet climate state.Here is a picture of the model we\'re going to implement.(Image: Markovian policy graph)There are five nodes in our graph. Each node is named by a tuple (t, i), where t is the stage for t=1,2,3, and i is the Markov state for i=1,2. As before, the wavy lines denote the stagewise-independent random variable.For each stage, we need to provide a Markov transition matrix. This is an MxN matrix, where the element A[i, j] gives the probability of transitioning from Markov state i in the previous stage to Markov state j in the current stage. The first stage is special because we assume there is a \"zero\'th\" stage which has one Markov state (the round node in the graph above). Furthermore, the number of columns in the transition matrix of a stage (i.e. the number of Markov states) must equal the number of rows in the next stage\'s transition matrix. For our example, the vector of Markov transition matrices is given by:T = Array{Float64, 2}[\n    [ 1.0 ]\',\n    [ 0.75 0.25 ],\n    [ 0.75 0.25 ; 0.25 0.75 ]\n]note: Note\nMake sure to add the \' after the first transition matrix so Julia can distinguish between a vector and a matrix."
},

{
    "location": "tutorial/04_markov_uncertainty/#Creating-a-model-1",
    "page": "Basic IV: Markov uncertainty",
    "title": "Creating a model",
    "category": "section",
    "text": "using SDDP, GLPK\n\nΩ = [\n    (inflow = 0.0, fuel_multiplier = 1.5),\n    (inflow = 50.0, fuel_multiplier = 1.0),\n    (inflow = 100.0, fuel_multiplier = 0.75)\n]\n\nmodel = SDDP.MarkovianPolicyGraph(\n            transition_matrices = Array{Float64, 2}[\n                [ 1.0 ]\',\n                [ 0.75 0.25 ],\n                [ 0.75 0.25 ; 0.25 0.75 ]\n            ],\n            sense = :Min,\n            lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, node\n    # Unpack the stage and Markov index.\n    t, markov_state = node\n    # Define the state variable.\n    @variable(subproblem, 0 <= volume <= 200, SDDP.State, initial_value = 200)\n    # Define the control variables.\n    @variables(subproblem, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n        inflow\n    end)\n    # Define the constraints\n    @constraints(subproblem, begin\n        volume.out == volume.in + inflow - hydro_generation - hydro_spill\n        thermal_generation + hydro_generation == 150.0\n    end)\n    # Note how we can use `markov_state` to dispatch an `if` statement.\n    probability = if markov_state == 1  # wet climate state\n        [1/6, 1/3, 1/2]\n    else  # dry climate state\n        [1/2, 1/3, 1/6]\n    end\n\n    fuel_cost = [50.0, 100.0, 150.0]\n    SDDP.parameterize(subproblem, Ω, probability) do ω\n        JuMP.fix(inflow, ω.inflow)\n        @stageobjective(subproblem,\n            ω.fuel_multiplier * fuel_cost[t] * thermal_generation)\n    end\nend\n\n# output\n\nA policy graph with 5 nodes.\n Node indices: (1, 1), (2, 1), (2, 2), (3, 1), (3, 2)info: Info\nFor more information on SDDP.MarkovianPolicyGraphs, read Intermediate III: policy graphs."
},

{
    "location": "tutorial/04_markov_uncertainty/#Training-and-simulating-the-policy-1",
    "page": "Basic IV: Markov uncertainty",
    "title": "Training and simulating the policy",
    "category": "section",
    "text": "As in the previous three tutorials, we train the policy:julia> SDDP.train(model; iteration_limit = 10)\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\nNumerical stability report\n  Non-zero Matrix range     [1e+00, 1e+00]\n  Non-zero Objective range  [1e+00, 2e+02]\n  Non-zero Bounds range     [2e+02, 2e+02]\n  Non-zero RHS range        [2e+02, 2e+02]\nNo problems detected\n\n Iteration    Simulation       Bound         Time (s)\n        1    2.250000e+04   5.329294e+03   9.999275e-04\n        2    5.306122e+03   7.975336e+03   3.000021e-03\n        3    1.250000e+04   8.072917e+03   3.999949e-03\n        4    1.875000e+03   8.072917e+03   5.999804e-03\n        5    1.875000e+03   8.072917e+03   6.999969e-03\n        6    1.875000e+03   8.072917e+03   8.999825e-03\n        7    5.000000e+03   8.072917e+03   9.999990e-03\n        8    5.000000e+03   8.072917e+03   1.199985e-02\n        9    1.625000e+04   8.072917e+03   1.300001e-02\n       10    5.000000e+03   8.072917e+03   1.499987e-02\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------Instead of performing a Monte Carlo simulation like the previous tutorials, we may want to simulate one particular sequence of noise realizations. This historical simulation can also be conducted by passing a SDDP.Historical sampling scheme to the sampling_scheme keyword of the SDDP.simulate function.We can confirm that the historical sequence of nodes was visited by querying the :node_index key of the simulation results.simulations = SDDP.simulate(\n    model,\n    sampling_scheme = SDDP.Historical([\n        ((1, 1), Ω[1]),\n        ((2, 2), Ω[3]),\n        ((3, 1), Ω[2])\n    ])\n)\n\n[stage[:node_index] for stage in simulations[1]]\n\n# output\n\n3-element Array{Tuple{Int64,Int64},1}:\n (1, 1)\n (2, 2)\n (3, 1)This concludes our fourth tutorial for SDDP.jl. In the next tutorial, Basic V: plotting we discuss the plotting utilities included in SDDP.jl."
},

{
    "location": "tutorial/05_plotting/#",
    "page": "Basic V: plotting",
    "title": "Basic V: plotting",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "tutorial/05_plotting/#Basic-V:-plotting-1",
    "page": "Basic V: plotting",
    "title": "Basic V: plotting",
    "category": "section",
    "text": "In our previous tutorials, we formulated, solved, and simulated multistage stochastic optimization problems. However, we haven\'t really investigated what the solution looks like. Luckily, SDDP.jl includes a number of plotting tools to help us do that. In this tutorial, we explain the tools and make some pretty pictures."
},

{
    "location": "tutorial/05_plotting/#Preliminaries-1",
    "page": "Basic V: plotting",
    "title": "Preliminaries",
    "category": "section",
    "text": "First, we need to create a policy and simulate some trajectories. So, let\'s take the model from  Basic IV: Markov uncertainty, train it for 20 iterations, and then simulate 100 Monte Carlo realizations of the policy.using SDDP, GLPK\nΩ = [\n    (inflow = 0.0, fuel_multiplier = 1.5),\n    (inflow = 50.0, fuel_multiplier = 1.0),\n    (inflow = 100.0, fuel_multiplier = 0.75)\n]\nmodel = SDDP.MarkovianPolicyGraph(\n            transition_matrices = Array{Float64, 2}[\n                [1.0]\', [0.75 0.25], [0.75 0.25 ; 0.25 0.75]],\n            sense = :Min, lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, node\n    t, markov_state = node\n    @variable(subproblem, 0 <= volume <= 200, SDDP.State, initial_value = 200)\n    @variable(subproblem, thermal_generation >= 0)\n    @variable(subproblem, hydro_generation >= 0)\n    @variable(subproblem, hydro_spill >= 0)\n    @variable(subproblem, inflow)\n    @constraint(subproblem,\n        volume.out == volume.in + inflow - hydro_generation - hydro_spill)\n    @constraint(subproblem, thermal_generation + hydro_generation == 150.0)\n    probability = markov_state == 1 ? [1/6, 1/3, 1/2] : [1/2, 1/3, 1/6]\n    fuel_cost = [50.0, 100.0, 150.0]\n    SDDP.parameterize(subproblem, Ω, probability) do ω\n        JuMP.fix(inflow, ω.inflow)\n        @stageobjective(subproblem,\n            ω.fuel_multiplier * fuel_cost[t] * thermal_generation)\n    end\nend\n\nSDDP.train(model, iteration_limit = 20, run_numerical_stability_report = false)\n\nsimulations = SDDP.simulate(\n    model, 100,\n    [:volume, :thermal_generation, :hydro_generation, :hydro_spill])\n\nprintln(\"Completed $(length(simulations)) simulations.\")\n\n# output\n\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\n Iteration    Simulation       Bound         Time (s)\n        1    0.000000e+00   7.196558e+03   7.990000e-01\n        2    7.169118e+03   8.024230e+03   8.090000e-01\n        3    1.875000e+03   8.024230e+03   8.110001e-01\n        4    1.312500e+04   8.024230e+03   8.120000e-01\n        5    9.146739e+03   8.072917e+03   8.140001e-01\n        6    1.250000e+04   8.072917e+03   8.150001e-01\n        7    1.250000e+04   8.072917e+03   8.160000e-01\n        8    1.875000e+03   8.072917e+03   8.180001e-01\n        9    1.875000e+03   8.072917e+03   8.190000e-01\n       10    9.375000e+03   8.072917e+03   8.199999e-01\n       11    3.375000e+04   8.072917e+03   8.220000e-01\n       12    1.125000e+04   8.072917e+03   8.230000e-01\n       13    2.437500e+04   8.072917e+03   8.250000e-01\n       14    2.250000e+04   8.072917e+03   8.270001e-01\n       15    1.875000e+03   8.072917e+03   8.280001e-01\n       16    5.000000e+03   8.072917e+03   8.299999e-01\n       17    1.312500e+04   8.072917e+03   8.310001e-01\n       18    5.000000e+03   8.072917e+03   8.320000e-01\n       19    1.625000e+04   8.072917e+03   8.340001e-01\n       20    1.875000e+03   8.072917e+03   8.350000e-01\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------\nCompleted 100 simulations.Great! Now we have some data in simulations to visualize."
},

{
    "location": "tutorial/05_plotting/#Spaghetti-plots-1",
    "page": "Basic V: plotting",
    "title": "Spaghetti plots",
    "category": "section",
    "text": "The first plotting utility we discuss is a spaghetti plot (you\'ll understand the name when you see the graph).To create a spaghetti plot, begin by creating a new SDDP.SpaghettiPlot instance as follows:julia> plt = SDDP.SpaghettiPlot(simulations)\nA spaghetti plot with 100 scenarios and 3 stages.We can add plots to plt using the SDDP.add_spaghetti function.julia> SDDP.add_spaghetti(plt; title = \"Reservoir volume\") do data\n           return data[:volume].out\n       endYou don\'t have just return values from the simulation, you can compute things too.julia> SDDP.add_spaghetti(plt;\n               title = \"Fuel cost\", ymin = 0, ymax = 250) do data\n           if data[:thermal_generation] > 0\n               return data[:stage_objective] / data[:thermal_generation]\n           else  # No thermal generation, so return 0.0.\n               return 0.0\n           end\n       endNote that there are many keyword arguments in addition to title. For example, we fixed the minimum and maximum values of the y-axis using ymin and ymax. See the SDDP.add_spaghetti documentation for all the arguments.Having built the plot, we now need to display it.julia> SDDP.save(plt, \"spaghetti_plot.html\", open = true)This should open a webpage that looks like this one.Using the mouse, you can highlight individual trajectories by hovering over them. This makes it possible to visualize a single trajectory across multiple dimensions.If you click on the plot, then trajectories that are close to the mouse pointer are shown darker and those further away are shown lighter."
},

{
    "location": "tutorial/05_plotting/#Publication-plots-1",
    "page": "Basic V: plotting",
    "title": "Publication plots",
    "category": "section",
    "text": "Instead of the interactive Javascript plots, you can also create some publication ready plots using the SDDP.publication_plot function.!!!info     You need to install the Plots.jl     package for this to work. We used the GR backend (gr()), but any     Plots.jl backend should work.SDDP.publication_plot implements a plot recipe to create ribbon plots of each variable against the stages. The first argument is the vector of simulation dictionaries and the second argument is the dictionary key that you want to plot. Standard Plots.jl keyword arguments such as title and xlabel can be used to modify the look of each plot. By default, the plot displays ribbons of the 0-100, 10-90, and 25-75 percentiles. The dark, solid line in the middle is the median (i.e. 50\'th percentile).using Plots\nplot(\n    SDDP.publication_plot(simulations, title = \"Outgoing volume\") do data\n        return data[:volume].out\n    end,\n    SDDP.publication_plot(simulations, title = \"Thermal generation\") do data\n        return data[:thermal_generation]\n    end,\n    xlabel = \"Stage\",\n    ylims = (0, 200),\n    layout = (1, 2),\n    margin_bottom = 5,\n    size = (1000, 300)\n)This should open a plot window with a plot that looks like:(Image: publication plot)You can save this plot as a PDF using the Plots.jl function savefig:Plots.savefig(\"my_picture.pdf\")This concludes our fifth tutorial for SDDP.jl. In our next tutorial, Basic VI: words of warning we discuss some of the issues that you should be aware of when creating your own models."
},

{
    "location": "tutorial/06_warnings/#",
    "page": "Basic VI: words of warning",
    "title": "Basic VI: words of warning",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "tutorial/06_warnings/#Basic-VI:-words-of-warning-1",
    "page": "Basic VI: words of warning",
    "title": "Basic VI: words of warning",
    "category": "section",
    "text": "SDDP is a powerful solution technique for multistage stochastic programming. However, there are a number of subtle things to be aware of before creating your own models."
},

{
    "location": "tutorial/06_warnings/#Numerical-stability-1",
    "page": "Basic VI: words of warning",
    "title": "Numerical stability",
    "category": "section",
    "text": "If you aren\'t aware, SDDP builds an outer-approximation to a convex function using cutting planes. This results in a formulation that is particularly hard for solvers like GLPK, Gurobi, and CPLEX to deal with. As a result, you may run into weird behavior. This behavior could includeIterations suddenly taking a long time (the solver stalled)\nSubproblems turning infeasible or unbounded after many iterations\nSolvers returning \"Numerical Error\" statuses"
},

{
    "location": "tutorial/06_warnings/#Problem-scaling-1",
    "page": "Basic VI: words of warning",
    "title": "Problem scaling",
    "category": "section",
    "text": "In almost all cases, the cause of this is poor problem scaling. For our purpose, poor problem scaling means having variables with very large numbers and variables with very small numbers in the same model.info: Info\nGurobi has an excellent set of articles on numerical issues and how to avoid them.Consider, for example, the hydro-thermal scheduling problem we have been discussing in previous tutorials.If we define the volume of the reservoir in terms of m³, then a lake might have a capacity of 10^10 m³: @variable(subproblem, 0 <= volume <= 10^10). Moreover, the cost per cubic meter might be around \\$0.05/m³. To calculate the  value of water in our reservoir, we need to multiple a variable on the order of 10^10, by one on the order of 10⁻²!. That is twelve orders of magnitude!To improve the performance of the SDDP algorithm (and reduce the chance of weird behavior), try to re-scale the units of the problem in order to reduce the largest difference in magnitude. For example, if we talk in terms of million m³, then we have a capacity of 10⁴ million m³, and a price of \\$50,000 per million m³. Now things are only one order of magnitude apart."
},

{
    "location": "tutorial/06_warnings/#Numerical-stability-report-1",
    "page": "Basic VI: words of warning",
    "title": "Numerical stability report",
    "category": "section",
    "text": "To aid in the diagnose of numerical issues, you can call SDDP.numerical_stability_report. By default, this aggregates all of the nodes into a single report. You can produce a stability report for each node by passing by_node=true.using SDDP\n\nmodel = SDDP.LinearPolicyGraph(\n        stages = 2, lower_bound = -1e10, direct_mode=false) do subproblem, t\n    @variable(subproblem, x >= -1e7, SDDP.State, initial_value=1e-5)\n    @constraint(subproblem, 1e9 * x.out >= 1e-6 * x.in + 1e-8)\n    @stageobjective(subproblem, 1e9 * x.out)\nend\n\nSDDP.numerical_stability_report(model)\n\n# output\n\nNumerical stability report\n  Non-zero Matrix range     [1e-06, 1e+09]\n  Non-zero Objective range  [1e+00, 1e+09]\n  Non-zero Bounds range     [1e+07, 1e+10]\n  Non-zero RHS range        [1e-08, 1e-08]\nWARNING: numerical stability issues detected\n  - Matrix range contains small coefficients\n  - Matrix range contains large coefficients\n  - Objective range contains large coefficients\n  - Bounds range contains large coefficients\n  - RHS range contains small coefficients\nVery large or small absolute values of coefficients\ncan cause numerical stability issues. Consider\nreformulating the model.The report analyses the magnitude (in absolute terms) of the coefficients in the constraint matrix, the objective function, any variable bounds, and in the RHS of the constraints. A warning will be thrown in SDDP.jl detects very large or small values. As discussed in Problem scaling, this is an indication that you should reformulate your model.By default, a numerical stability check is run when you call SDDP.train, although it can be turned off by passing run_numerical_stability_report = false."
},

{
    "location": "tutorial/06_warnings/#Solver-specific-options-1",
    "page": "Basic VI: words of warning",
    "title": "Solver-specific options",
    "category": "section",
    "text": "If you have a particularly troublesome model, you should investigate setting solver-specific options to improve the numerical stability of each solver. For example, Gurobi has a NumericFocus option."
},

{
    "location": "tutorial/06_warnings/#Choosing-an-initial-bound-1",
    "page": "Basic VI: words of warning",
    "title": "Choosing an initial bound",
    "category": "section",
    "text": "One of the important requirements when building a SDDP model is to choose an appropriate bound on the objective (lower if minimizing, upper if maximizing). However, it can be hard to choose a bound if you don\'t know the solution! (Which is very likely.)The bound should not be as large as possible (since this will help with convergence and the numerical issues discussed above), but if chosen to small, it may cut of the feasible region and lead to a sub-optimal solution.Consider the following simple model, where we first set lower_bound to 0.0.using SDDP, GLPK\n\nmodel = SDDP.LinearPolicyGraph(\n            stages = 3,\n            sense = :Min,\n            lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, t\n    @variable(subproblem, x >= 0, SDDP.State, initial_value = 2)\n    @variable(subproblem, u >= 0)\n    @variable(subproblem, v >= 0)\n    @constraint(subproblem, x.out == x.in - u)\n    @constraint(subproblem, u + v == 1.5)\n    @stageobjective(subproblem, t * v)\nend\n\nSDDP.train(model, iteration_limit = 5, run_numerical_stability_report=false)\n\n# output\n\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\n Iteration    Simulation       Bound         Time (s)\n        1    6.500000e+00   3.000000e+00   0.000000e+00\n        2    3.500000e+00   3.500000e+00   9.999275e-04\n        3    3.500000e+00   3.500000e+00   9.999275e-04\n        4    3.500000e+00   3.500000e+00   2.000093e-03\n        5    3.500000e+00   3.500000e+00   2.000093e-03\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------Now consider the case when we set the lower_bound to 10.0:using SDDP, GLPK\n\nmodel = SDDP.LinearPolicyGraph(\n            stages = 3,\n            sense = :Min,\n            lower_bound = 10.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, t\n    @variable(subproblem, x >= 0, SDDP.State, initial_value = 2)\n    @variable(subproblem, u >= 0)\n    @variable(subproblem, v >= 0)\n    @constraint(subproblem, x.out == x.in - u)\n    @constraint(subproblem, u + v == 1.5)\n    @stageobjective(subproblem, t * v)\nend\n\nSDDP.train(model, iteration_limit = 5, run_numerical_stability_report=false)\n\n# output\n\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\n Iteration    Simulation       Bound         Time (s)\n        1    6.500000e+00   1.100000e+01   0.000000e+00\n        2    5.500000e+00   1.100000e+01   1.000166e-03\n        3    5.500000e+00   1.100000e+01   1.000166e-03\n        4    5.500000e+00   1.100000e+01   2.000093e-03\n        5    5.500000e+00   1.100000e+01   2.000093e-03\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------How do we tell which is more appropriate? There are a few clues that you should look out for.The bound converges to a value above (if minimizing) the simulated cost of the policy. In this case, the problem is deterministic, so it is easy to tell. But you can also check by performing a Monte Carlo simulation like we did in Basic II: adding uncertainty.\nThe bound converges to different values when we change the bound. This is another clear give-away. The bound provided by the user is only used in the initial iterations. It should not change the value of the converged policy. Thus, if you don\'t know an appropriate value for the bound, choose an initial value, and then increase (or decrease) the value of the bound to confirm that the value of the policy doesn\'t change.\nThe bound converges to a value close to the bound provided by the user. This varies between models, but notice that 11.0 is quite close to 10.0 compared with 3.5 and 0.0.This concludes our sixth tutorial for SDDP.jl. In our final basics tutorial, Basic VII: modelling tips we discuss some additional modelling tips."
},

{
    "location": "tutorial/07_advanced_modelling/#",
    "page": "Basic VII: modelling tips",
    "title": "Basic VII: modelling tips",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/07_advanced_modelling/#Basic-VII:-modelling-tips-1",
    "page": "Basic VII: modelling tips",
    "title": "Basic VII: modelling tips",
    "category": "section",
    "text": "This tutorial discusses some different modelling tips.DocTestSetup = quote\n    using SDDP, GLPK\nend"
},

{
    "location": "tutorial/07_advanced_modelling/#Saving-the-policy-1",
    "page": "Basic VII: modelling tips",
    "title": "Saving the policy",
    "category": "section",
    "text": "Once you have finished training the policy, you can write the cuts to file using SDDP.write_cuts_to_file. You can read these cuts into a new model using SDDP.read_cuts_from_file. Note that the model must have the same number (and names) of the state variables, as well as the same number and names of the nodes."
},

{
    "location": "tutorial/07_advanced_modelling/#Multi-dimensional-state-variables-1",
    "page": "Basic VII: modelling tips",
    "title": "Multi-dimensional state variables",
    "category": "section",
    "text": "Just like normal JuMP variables, it is possible to create containers of state variables.julia> model = SDDP.LinearPolicyGraph(\n               stages=1, lower_bound = 0, optimizer = with_optimizer(GLPK.Optimizer)\n               ) do subproblem, t\n           # A scalar state variable.\n           @variable(subproblem, x >= 0, SDDP.State, initial_value = 0)\n           println(\"Lower bound of outgoing x is: \", JuMP.lower_bound(x.out))\n           # A vector of state variables.\n           @variable(subproblem, y[i = 1:2] >= i, SDDP.State, initial_value = i)\n           println(\"Lower bound of outgoing y[1] is: \", JuMP.lower_bound(y[1].out))\n           # A JuMP.Containers.DenseAxisArray of state variables.\n           @variable(subproblem,\n               z[i = 3:4, j = [:A, :B]] >= i, SDDP.State, initial_value = i)\n           println(\"Lower bound of outgoing z[3, :B] is: \", JuMP.lower_bound(z[3, :B].out))\n       end;\nLower bound of outgoing x is: 0.0\nLower bound of outgoing y[1] is: 1.0\nLower bound of outgoing z[3, :B] is: 3.0"
},

{
    "location": "tutorial/07_advanced_modelling/#Multi-dimensional-noise-terms-1",
    "page": "Basic VII: modelling tips",
    "title": "Multi-dimensional noise terms",
    "category": "section",
    "text": "Multi-dimensional stagewise-independent random variables can be created by forming the Cartesian product of the random variables.julia> model = SDDP.LinearPolicyGraph(\n               stages=3, lower_bound = 0, optimizer = with_optimizer(GLPK.Optimizer)\n               ) do subproblem, t\n           @variable(subproblem, x, SDDP.State, initial_value = 0.0)\n           support = [(value = v, coefficient = c) for v in [1, 2] for c in [3, 4, 5]]\n           probability = [pv * pc for pv in [0.5, 0.5] for pc in [0.3, 0.5, 0.2]]\n           SDDP.parameterize(subproblem, support, probability) do ω\n               JuMP.fix(x.out, ω.value)\n               @stageobjective(subproblem, ω.coefficient * x.out)\n               println(\"ω is: \", ω)\n           end\n       end;\n\njulia> SDDP.simulate(model, 1);\nω is: (value = 1, coefficient = 4)\nω is: (value = 1, coefficient = 3)\nω is: (value = 2, coefficient = 4)"
},

{
    "location": "tutorial/07_advanced_modelling/#Noise-in-the-constraint-matrix-1",
    "page": "Basic VII: modelling tips",
    "title": "Noise in the constraint matrix",
    "category": "section",
    "text": "SDDP.jl supports coefficients in the constraint matrix through the JuMP.set_coefficient function.julia> model = SDDP.LinearPolicyGraph(\n               stages=3, lower_bound = 0, optimizer = with_optimizer(GLPK.Optimizer)\n               ) do subproblem, t\n           @variable(subproblem, x, SDDP.State, initial_value = 0.0)\n           @constraint(subproblem, emissions, 1x.out <= 1)\n           SDDP.parameterize(subproblem, [0.2, 0.5, 1.0]) do ω\n               JuMP.set_coefficient(emissions, x.out, ω)\n               println(emissions)\n           end\n           @stageobjective(subproblem, -x.out)\n       end\nA policy graph with 3 nodes.\n Node indices: 1, 2, 3\n\njulia> SDDP.simulate(model, 1);\nemissions : x_out <= 1.0\nemissions : 0.2 x_out <= 1.0\nemissions : 0.5 x_out <= 1.0note: Note\nJuMP will canonicalize constraints by moving all variables to the left-hand side. Thus, @constraint(model, 0 <= 1 - x.out) becomes x.out <= 1. JuMP.set_coefficient sets the coefficient on the canonicalized constraint.This concludes or series of basic introductory tutorials for SDDP.jl. When you\'re ready, continue to our intermediate series of tutorials, beginning with Intermediate I: risk."
},

{
    "location": "tutorial/11_risk/#",
    "page": "Intermediate I: risk",
    "title": "Intermediate I: risk",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/11_risk/#Intermediate-I:-risk-1",
    "page": "Intermediate I: risk",
    "title": "Intermediate I: risk",
    "category": "section",
    "text": "DocTestSetup = quote\n    using SDDP, GLPK\nend"
},

{
    "location": "tutorial/11_risk/#Risk-measures-1",
    "page": "Intermediate I: risk",
    "title": "Risk measures",
    "category": "section",
    "text": "To illustrate the risk-measures included in SDDP.jl, we consider a discrete random variable with four outcomes.The random variable is supported on the values 1, 2, 3, and 4:julia> noise_supports = [1, 2, 3, 4]\n4-element Array{Int64,1}:\n 1\n 2\n 3\n 4The associated probability of each outcome is as follows:julia> nominal_probability = [0.1, 0.2, 0.3, 0.4]\n4-element Array{Float64,1}:\n 0.1\n 0.2\n 0.3\n 0.4With each outcome ω, the agent observes a cost Z(ω):julia> cost_realizations = [5.0, 4.0, 6.0, 2.0]\n4-element Array{Float64,1}:\n 5.0\n 4.0\n 6.0\n 2.0We assume that we are minimizing:julia> is_minimization = true\ntrueFinally, we create a vector that will be used to store the risk-adjusted probabilities:julia> risk_adjusted_probability = zeros(4)\n4-element Array{Float64,1}:\n 0.0\n 0.0\n 0.0\n 0.0"
},

{
    "location": "tutorial/11_risk/#SDDP.Expectation",
    "page": "Intermediate I: risk",
    "title": "SDDP.Expectation",
    "category": "type",
    "text": "Expectation()\n\nThe Expectation risk measure. Identical to taking the expectation with respect to the nominal distribution.\n\n\n\n\n\n"
},

{
    "location": "tutorial/11_risk/#Expectation-1",
    "page": "Intermediate I: risk",
    "title": "Expectation",
    "category": "section",
    "text": "SDDP.ExpectationSDDP.adjust_probability(\n    SDDP.Expectation(),\n    risk_adjusted_probability,\n    nominal_probability,\n    noise_supports,\n    cost_realizations,\n    is_minimization\n)\n\nrisk_adjusted_probability\n\n# output\n\n4-element Array{Float64,1}:\n 0.1\n 0.2\n 0.3\n 0.4SDDP.Expectation is the default risk measure in SDDP.jl."
},

{
    "location": "tutorial/11_risk/#SDDP.WorstCase",
    "page": "Intermediate I: risk",
    "title": "SDDP.WorstCase",
    "category": "type",
    "text": "WorstCase()\n\nThe worst-case risk measure. Places all of the probability weight on the worst outcome.\n\n\n\n\n\n"
},

{
    "location": "tutorial/11_risk/#Worst-case-1",
    "page": "Intermediate I: risk",
    "title": "Worst-case",
    "category": "section",
    "text": "SDDP.WorstCaseSDDP.adjust_probability(\n    SDDP.WorstCase(),\n    risk_adjusted_probability,\n    nominal_probability,\n    noise_supports,\n    cost_realizations,\n    is_minimization\n)\n\nrisk_adjusted_probability\n\n# output\n\n4-element Array{Float64,1}:\n 0.0\n 0.0\n 1.0\n 0.0"
},

{
    "location": "tutorial/11_risk/#SDDP.AVaR",
    "page": "Intermediate I: risk",
    "title": "SDDP.AVaR",
    "category": "type",
    "text": "AVaR(β)\n\nThe average value at risk (AV@R) risk measure.\n\nComputes the expectation of the β fraction of worst outcomes. β must be in [0, 1]. When β=1, this is equivalent to the Expectation risk measure. When β=0, this is equivalent  to the WorstCase risk measure.\n\nAV@R is also known as the conditional value at risk (CV@R) or expected shortfall.\n\n\n\n\n\n"
},

{
    "location": "tutorial/11_risk/#Average-value-at-risk-(AV@R)-1",
    "page": "Intermediate I: risk",
    "title": "Average value at risk (AV@R)",
    "category": "section",
    "text": "SDDP.AVaRSDDP.adjust_probability(\n    SDDP.AVaR(0.5),\n    risk_adjusted_probability,\n    nominal_probability,\n    noise_supports,\n    cost_realizations,\n    is_minimization\n)\n\nround.(risk_adjusted_probability, digits = 1)\n\n# output\n\n4-element Array{Float64,1}:\n 0.2\n 0.2\n 0.6\n 0.0"
},

{
    "location": "tutorial/11_risk/#SDDP.EAVaR",
    "page": "Intermediate I: risk",
    "title": "SDDP.EAVaR",
    "category": "function",
    "text": "EAVaR(;lambda=1.0, beta=1.0)\n\nA risk measure that is a convex combination of Expectation and Average Value @ Risk (also called Conditional Value @ Risk).\n\n    λ * E[x] + (1 - λ) * AV@R(1-β)[x]\n\nKeyword Arguments\n\nlambda: Convex weight on the expectation ((1-lambda) weight is put on the AV@R component. Inreasing values of lambda are less risk averse (more weight on expectation).\nbeta: The quantile at which to calculate the Average Value @ Risk. Increasing values of beta are less risk averse. If beta=0, then the AV@R component is the worst case risk measure.\n\n\n\n\n\n"
},

{
    "location": "tutorial/11_risk/#Convex-combination-of-risk-measures-1",
    "page": "Intermediate I: risk",
    "title": "Convex combination of risk measures",
    "category": "section",
    "text": "Using the axioms of coherent risk measures, it is easy to show that any convex combination of coherent risk measures is also a coherent risk measure. Convex combinations of risk measures can be created directly:julia> cvx_comb_measure = 0.5 * SDDP.Expectation() + 0.5 * SDDP.WorstCase()\nA convex combination of 0.5 * SDDP.Expectation() + 0.5 * SDDP.WorstCase()SDDP.adjust_probability(\n    cvx_comb_measure,\n    risk_adjusted_probability,\n    nominal_probability,\n    noise_supports,\n    cost_realizations,\n    is_minimization\n)\n\nrisk_adjusted_probability\n\n# output\n\n4-element Array{Float64,1}:\n 0.05\n 0.1\n 0.65\n 0.2As a special case, the SDDP.EAVaR risk-measure is a convex combination of SDDP.Expectation and SDDP.AVaR:julia> risk_measure = SDDP.EAVaR(beta=0.25, lambda=0.4)\nA convex combination of 0.4 * SDDP.Expectation() + 0.6 * SDDP.AVaR(0.25)SDDP.EAVaR"
},

{
    "location": "tutorial/11_risk/#Distributionally-robust-1",
    "page": "Intermediate I: risk",
    "title": "Distributionally robust",
    "category": "section",
    "text": "SDDP.jl supports two types of distrbutionally robust risk measures: the modified Χ² method of Philpott et al. (2018), and a method based on the Wasserstein distance metric."
},

{
    "location": "tutorial/11_risk/#SDDP.ModifiedChiSquared",
    "page": "Intermediate I: risk",
    "title": "SDDP.ModifiedChiSquared",
    "category": "type",
    "text": "ModifiedChiSquared(radius::Float64)\n\nThe distributionally robust SDDP risk measure of\n\nPhilpott, A., de Matos, V., Kapelevich, L. Distributionally robust SDDP. Computational Management Science (2018) 165:431-454.\n\n\n\n\n\n"
},

{
    "location": "tutorial/11_risk/#Modified-Chi-squard-1",
    "page": "Intermediate I: risk",
    "title": "Modified Chi-squard",
    "category": "section",
    "text": "SDDP.ModifiedChiSquaredSDDP.adjust_probability(\n    SDDP.ModifiedChiSquared(0.5),\n    risk_adjusted_probability,\n    [0.25, 0.25, 0.25, 0.25],\n    noise_supports,\n    cost_realizations,\n    is_minimization\n)\n\nround.(risk_adjusted_probability, digits = 4)\n\n# output\n\n4-element Array{Float64,1}:\n 0.3333\n 0.0447\n 0.622\n 0.0"
},

{
    "location": "tutorial/11_risk/#SDDP.Wasserstein",
    "page": "Intermediate I: risk",
    "title": "SDDP.Wasserstein",
    "category": "type",
    "text": "Wasserstein(norm::Function, solver_factory; alpha::Float64)\n\nA distributionally-robust risk measure based on the Wasserstein distance.\n\nAs alpha increases, the measure becomes more risk-averse. When alpha=0, the measure is equivalent to the expectation operator. As alpha increases, the measure approaches the Worst-case risk measure.\n\n\n\n\n\n"
},

{
    "location": "tutorial/11_risk/#Wasserstein-1",
    "page": "Intermediate I: risk",
    "title": "Wasserstein",
    "category": "section",
    "text": "SDDP.Wassersteinrisk_measure = SDDP.Wasserstein(\n        with_optimizer(GLPK.Optimizer); alpha=0.5) do x, y\n   return abs(x - y)\nend\n\nSDDP.adjust_probability(\n    risk_measure,\n    risk_adjusted_probability,\n    nominal_probability,\n    noise_supports,\n    cost_realizations,\n    is_minimization\n)\n\nround.(risk_adjusted_probability, digits = 1)\n\n# output\n\n4-element Array{Float64,1}:\n 0.1\n 0.1\n 0.8\n 0.0"
},

{
    "location": "tutorial/11_risk/#Training-a-risk-averse-model-1",
    "page": "Intermediate I: risk",
    "title": "Training a risk-averse model",
    "category": "section",
    "text": "Now that we know what risk measures SDDP.jl supports, lets see how to train a policy using them. There are three possible ways.If the same risk measure is used at every node in the policy graph, we can just pass an instance of one of the risk measures to the risk_measure keyword argument of the SDDP.train function.SDDP.train(\n    model,\n    risk_measure = SDDP.WorstCase(),\n    iteration_limit = 10\n)However, if you want different risk measures at different nodes, there are two options. First, you can pass risk_measure a dictionary of risk measures, with one entry for each node. The keys of the dictionary are the indices of the nodes.SDDP.train(\n    model,\n    risk_measure = Dict(\n        1 => SDDP.Expectation(),\n        2 => SDDP.WorstCase()\n    ),\n    iteration_limit = 10\n)An alternative method is to pass risk_measure a function that takes one argument, the index of a node, and returns an instance of a risk measure:SDDP.train(\n    model,\n    risk_measure = (node_index) -> begin\n        if node_index == 1\n            return SDDP.Expectation()\n        else\n            return SDDP.WorstCase()\n        end\n    end,\n    iteration_limit = 10\n)note: Note\nIf you simulate the policy, the simulated value is the risk-neutral value of the policy.This concludes our first intermediate tutorial. In the next tutorial, Intermediate II: stopping rules, we discuss different ways that the training can be terminated.DocTestSetup = nothing"
},

{
    "location": "tutorial/12_stopping_rules/#",
    "page": "Intermediate II: stopping rules",
    "title": "Intermediate II: stopping rules",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/12_stopping_rules/#Intermediate-II:-stopping-rules-1",
    "page": "Intermediate II: stopping rules",
    "title": "Intermediate II: stopping rules",
    "category": "section",
    "text": "The theory of SDDP tells us that the algorithm converges to an optimal policy almost surely in a finite number of iterations. In practice, this number is very large. Therefore, we need some way of pre-emptively terminating SDDP when the solution is “good enough.” We call heuristics for pre-emptively terminating SDDP stopping rules."
},

{
    "location": "tutorial/12_stopping_rules/#Basic-limits-1",
    "page": "Intermediate II: stopping rules",
    "title": "Basic limits",
    "category": "section",
    "text": "The training of an SDDP policy can be terminated after a fixed number of iterations using the iteration_limit keyword.SDDP.train(model, iteration_limit = 10)The training of an SDDP policy can be terminated after a fixed number of seconds using the time_limit keyword.SDDP.train(model, time_limit = 2.0)"
},

{
    "location": "tutorial/12_stopping_rules/#SDDP.IterationLimit",
    "page": "Intermediate II: stopping rules",
    "title": "SDDP.IterationLimit",
    "category": "type",
    "text": "IterationLimit(limit::Int)\n\nTeriminate the algorithm after limit number of iterations.\n\n\n\n\n\n"
},

{
    "location": "tutorial/12_stopping_rules/#SDDP.TimeLimit",
    "page": "Intermediate II: stopping rules",
    "title": "SDDP.TimeLimit",
    "category": "type",
    "text": "TimeLimit(limit::Float64)\n\nTeriminate the algorithm after limit seconds of computation.\n\n\n\n\n\n"
},

{
    "location": "tutorial/12_stopping_rules/#SDDP.Statistical",
    "page": "Intermediate II: stopping rules",
    "title": "SDDP.Statistical",
    "category": "type",
    "text": "Statistical(; num_replications, iteration_period = 1, z_score = 1.96,\n            verbose = true)\n\nPerform an in-sample Monte Carlo simulation of the policy with num_replications replications every iteration_periods. Terminate if the deterministic bound (lower if minimizing) calls into the confidence interval for the mean of the simulated cost. If verbose = true, print the confidence interval.\n\nNote that this tests assumes that the simulated values are normally distributed. In infinite horizon models, this is almost never the case. The distribution is usually closer to exponential or log-normal.\n\n\n\n\n\n"
},

{
    "location": "tutorial/12_stopping_rules/#SDDP.BoundStalling",
    "page": "Intermediate II: stopping rules",
    "title": "SDDP.BoundStalling",
    "category": "type",
    "text": "BoundStalling(num_previous_iterations::Int, tolerance::Float64)\n\nTeriminate the algorithm once the deterministic bound (lower if minimizing, upper if maximizing) fails to improve by more than tolerance in absolute terms for more than num_previous_iterations consecutve iterations.\n\n\n\n\n\n"
},

{
    "location": "tutorial/12_stopping_rules/#Stopping-rules-1",
    "page": "Intermediate II: stopping rules",
    "title": "Stopping rules",
    "category": "section",
    "text": "In addition to the limits provided as keyword arguments, a variety of other stopping rules are available. These can be passed to SDDP.train as a vector to the stopping_rules keyword. For example:SDDP.train(model, stopping_rules = [SDDP.BoundStalling(10, 1e-4)])Here are the stopping rules implemented in SDDP.jl:SDDP.IterationLimit\nSDDP.TimeLimit\nSDDP.Statistical\nSDDP.BoundStallingIn the next tutorial, Intermediate III: policy graphs, we discuss generic extensions to SDDP.LinearPolicyGraph and SDDP.MarkovianPolicyGraph."
},

{
    "location": "tutorial/13_generic_graphs/#",
    "page": "Intermediate III: policy graphs",
    "title": "Intermediate III: policy graphs",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/13_generic_graphs/#Intermediate-III:-policy-graphs-1",
    "page": "Intermediate III: policy graphs",
    "title": "Intermediate III: policy graphs",
    "category": "section",
    "text": "DocTestSetup = quote\n    using SDDP, GLPK\nendSDDP.jl uses the concept of a policy graph to formulate multistage stochastic programming problems. We highly recommend that you read the following paper before continuing with this tutorial.Dowson, O. (2018). The policy graph decomposition of multistage stochastic optimization problems. Optimization Online. link"
},

{
    "location": "tutorial/13_generic_graphs/#Creating-a-[SDDP.Graph](@ref)-1",
    "page": "Intermediate III: policy graphs",
    "title": "Creating a SDDP.Graph",
    "category": "section",
    "text": ""
},

{
    "location": "tutorial/13_generic_graphs/#Linear-graphs-1",
    "page": "Intermediate III: policy graphs",
    "title": "Linear graphs",
    "category": "section",
    "text": "Linear policy graphs can be created using the SDDP.LinearGraph function.julia> graph = SDDP.LinearGraph(3)\nRoot\n 0\nNodes\n 1\n 2\n 3\nArcs\n 0 => 1 w.p. 1.0\n 1 => 2 w.p. 1.0\n 2 => 3 w.p. 1.0We can add nodes to a graph using SDDP.add_node and edges using SDDP.add_edge.julia> SDDP.add_node(graph, 4)\n\njulia> SDDP.add_edge(graph, 3 => 4, 1.0)\n\njulia> SDDP.add_edge(graph, 4 => 1, 0.9)\n\njulia> graph\nRoot\n 0\nNodes\n 1\n 2\n 3\n 4\nArcs\n 0 => 1 w.p. 1.0\n 1 => 2 w.p. 1.0\n 2 => 3 w.p. 1.0\n 3 => 4 w.p. 1.0\n 4 => 1 w.p. 0.9Look! We just made a cyclic graph! SDDP.jl can solve infinite horizon problems. The probability on the arc that completes a cycle should be interpreted as a discount factor."
},

{
    "location": "tutorial/13_generic_graphs/#Markovian-policy-graphs-1",
    "page": "Intermediate III: policy graphs",
    "title": "Markovian policy graphs",
    "category": "section",
    "text": "Markovian policy graphs can be created using the SDDP.MarkovianGraph function.julia> SDDP.MarkovianGraph(Matrix{Float64}[[1.0]\', [0.4 0.6]])\nRoot\n (0, 1)\nNodes\n (1, 1)\n (2, 1)\n (2, 2)\nArcs\n (0, 1) => (1, 1) w.p. 1.0\n (1, 1) => (2, 1) w.p. 0.4\n (1, 1) => (2, 2) w.p. 0.6"
},

{
    "location": "tutorial/13_generic_graphs/#General-graphs-1",
    "page": "Intermediate III: policy graphs",
    "title": "General graphs",
    "category": "section",
    "text": "Arbitrarily complicated graphs can be constructed using SDDP.Graph, SDDP.add_node and SDDP.add_edge. For examplejulia> graph = SDDP.Graph(:root_node)\nRoot\n root_node\nNodes\nArcs\n\njulia> SDDP.add_node(graph, :decision_node)\n\njulia> SDDP.add_edge(graph, :root_node => :decision_node, 1.0)\n\njulia> SDDP.add_edge(graph, :decision_node => :decision_node, 0.9)\n\njulia> graph\nRoot\n root_node\nNodes\n decision_node\nArcs\n root_node => decision_node w.p. 1.0\n decision_node => decision_node w.p. 0.9"
},

{
    "location": "tutorial/13_generic_graphs/#Creating-a-policy-graph-1",
    "page": "Intermediate III: policy graphs",
    "title": "Creating a policy graph",
    "category": "section",
    "text": "Once you have constructed an instance of [SDDP.Graph], you can create a policy graph by passing the graph as the first argument.julia> graph = SDDP.Graph(\n           :root_node,\n           [:decision_node],\n           [\n               (:root_node => :decision_node, 1.0),\n               (:decision_node => :decision_node, 0.9)\n           ]);\n\njulia> model = SDDP.PolicyGraph(\n               graph,\n               lower_bound = 0,\n               optimizer = with_optimizer(GLPK.Optimizer)) do subproblem, node\n           println(\"Called from node: \", node)\n       end;\nCalled from node: decision_node"
},

{
    "location": "tutorial/13_generic_graphs/#Special-cases-1",
    "page": "Intermediate III: policy graphs",
    "title": "Special cases",
    "category": "section",
    "text": "There are two special cases which cover the majority of models in the literature.SDDP.LinearPolicyGraph is a special case where a SDDP.LinearGraph is passed as the first argument.\nSDDP.MarkovianPolicyGraph is a special case where a SDDP.MarkovianGraph is passed as the first argument.Note that the type of the names of all nodes (including the root node) must be the same. In this case, they are Symbols.In the next tutorial, Intermediate IV: objective states, we discuss how to model problems with stagewise-dependent objective uncertainty."
},

{
    "location": "tutorial/14_objective_states/#",
    "page": "Intermediate IV: objective states",
    "title": "Intermediate IV: objective states",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "tutorial/14_objective_states/#Intermediate-IV:-objective-states-1",
    "page": "Intermediate IV: objective states",
    "title": "Intermediate IV: objective states",
    "category": "section",
    "text": "There are many applications in which we want to model a price process that follows some auto-regressive process. Common examples include stock prices on financial exchanges and spot-prices in energy markets.However, it is well known that these cannot be incorporated in to SDDP because they result in cost-to-go functions that are convex with respect to some state variables (e.g., the reservoir levels) and concave with respect to other state variables (e.g., the spot price in the current stage).To overcome this problem, the approach in the literature has been to discretize the price process in order to model it using a Markovian policy graph like those discussed in Basic IV: Markov uncertainty.However, recent work offers a way to include stagewise-dependent objective uncertainty into the objective function of SDDP subproblems. Readers are directed to the following works for an introduction:Downward, A., Dowson, O., and Baucke, R. (2017). Stochastic dual dynamic programming with stagewise dependent objective uncertainty. Optimization Online. link\nDowson, O. PhD Thesis. University of Auckland, 2018. linkThe method discussed in the above works introduces the concept of an objective state into SDDP. Unlike normal state variables in SDDP (e.g., the volume of water in the reservoir), the cost-to-go function is concave with respect to the objective states. Thus, the method builds an outer approximation of the cost-to-go function in the normal state-space, and an inner approximation of the cost-to-go function in the objective state-space.warn: Warn\nSupport for objective states in SDDP.jl is experimental. Models are considerably more computational intensive, the interface is less user-friendly, and there are subtle gotchas to be aware of. Only use this if you have read and understood the theory behind the method."
},

{
    "location": "tutorial/14_objective_states/#One-dimensional-objective-states-1",
    "page": "Intermediate IV: objective states",
    "title": "One-dimensional objective states",
    "category": "section",
    "text": "Let\'s assume that the fuel cost is not fixed, but instead evolves according to a multiplicative auto-regressive process: fuel_cost[t] = ω * fuel_cost[t-1], where ω is drawn from the sample space [0.75, 0.9, 1.1, 1.25] with equal probability.An objective state can be added to a subproblem using the SDDP.add_objective_state function. This can only be called once per subproblem. If you want to add a multi-dimensional objective state, read Multi-dimensional objective states. SDDP.add_objective_state takes a number of keyword arguments. The two required ones areinitial_value: the value of the objective state at the root node of the policy graph (i.e., identical to the initial_value when defining normal state variables.\nlipschitz: the Lipschitz constant of the cost-to-go function with respect to the objective state. In other words, this value is the maximum change in the cost-to-go function at any point in the state space, given a one-unit change in the objective state.There are also two optional keyword arguments: lower_bound and upper_bound, which give SDDP.jl hints (importantly, not constraints) about the domain of the objective state. Setting these bounds appropriately can improve the speed of convergence.Finally, SDDP.add_objective_state requires an update function. This function takes two arguments. The first is the incoming value of the objective state, and the second is the realization of the stagewise-independent noise term (set using SDDP.parameterize). The function should return the value of the objective state to be used in the current subproblem.This connection with the stagewise-independent noise term means that SDDP.parameterize must be called in a subproblem that defines an objective state. Inside SDDP.parameterize, the value of the objective state to be used in the current subproblem (i.e., after the update function), can be queried using SDDP.objective_state.Here is the full model with the objective state.using SDDP, GLPK\n\nmodel = SDDP.LinearPolicyGraph(\n            stages = 3, sense = :Min, lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, t\n    @variable(subproblem, 0 <= volume <= 200, SDDP.State, initial_value = 200)\n    @variables(subproblem, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n        inflow\n    end)\n    @constraints(subproblem, begin\n        volume.out == volume.in + inflow - hydro_generation - hydro_spill\n        demand_constraint, thermal_generation + hydro_generation == 150.0\n    end)\n\n    ###\n    ### Add an objective state. ω will be the same value that is called in\n    ### `SDDP.parameterize`.\n    ###\n\n    SDDP.add_objective_state(\n            subproblem, initial_value = 50.0, lipschitz = 10_000.0,\n            lower_bound = 50.0, upper_bound = 150.0) do fuel_cost, ω\n        return ω.fuel * fuel_cost\n    end\n\n    ###\n    ### Create the cartesian product of a multi-dimensional random variable.\n    ###\n\n    Ω = [\n        (fuel = f, inflow = w)\n        for f in [0.75, 0.9, 1.1, 1.25] for w in [0.0, 50.0, 100.0]\n    ]\n\n    SDDP.parameterize(subproblem, Ω) do ω\n        ###\n        ### Query the current fuel cost.\n        ###\n\n        fuel_cost = SDDP.objective_state(subproblem)\n\n        @stageobjective(subproblem, fuel_cost * thermal_generation)\n        JuMP.fix(inflow, ω.inflow)\n    end\nend\n\n# output\n\nA policy graph with 3 nodes.\n Node indices: 1, 2, 3After creating our model, we can train and simulate as usual.SDDP.train(model, iteration_limit = 10, run_numerical_stability_report=false)\n\nsimulations = SDDP.simulate(model, 1)\n\nprint(\"Finished training and simulating.\")\n\n# output\n\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\n Iteration    Simulation       Bound         Time (s)\n        1    4.640625e+03   2.741935e+03   3.590002e-01\n        2    3.712500e+03   3.189655e+03   3.620000e-01\n        3    0.000000e+00   3.828698e+03   3.650000e-01\n        4    9.968750e+03   4.758841e+03   3.680000e-01\n        5    1.203125e+04   4.911521e+03   3.710001e-01\n        6    5.148317e+03   4.955041e+03   3.750000e-01\n        7    1.539894e+03   4.965653e+03   3.790002e-01\n        8    2.531250e+03   4.965653e+03   3.820002e-01\n        9    5.981250e+03   4.965653e+03   3.850000e-01\n       10    3.937500e+03   4.965653e+03   3.890002e-01\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------\nFinished training and simulating.To demonstrate how the objective states are updated, consider the sequence of noise observations:julia> [stage[:noise_term] for stage in simulations[1]]\n3-element Array{NamedTuple{(:fuel, :inflow),Tuple{Float64,Float64}},1}:\n (fuel = 0.75, inflow = 0.0)\n (fuel = 0.9, inflow = 50.0)\n (fuel = 1.25, inflow = 50.0)This, the fuel cost in the first stage should be 0.75 * 50 = 37.5. The fuel cost in the second stage should be 0.9 * 37.5 = 33.75. The fuel cost in the third stage should be 1.25 * 33.75 = 42.1875.To confirm this, the values of the objective state in a simulation can be queried using the :objective_state key.julia> [stage[:objective_state] for stage in simulations[1]]\n3-element Array{Float64,1}:\n 37.5\n 33.75\n 42.1875"
},

{
    "location": "tutorial/14_objective_states/#Multi-dimensional-objective-states-1",
    "page": "Intermediate IV: objective states",
    "title": "Multi-dimensional objective states",
    "category": "section",
    "text": "You can construct multi-dimensional price processes using NTuples. Just replace every scalar value associated with the objective state by a tuple. For example, initial_value = 1.0 becomes initial_value = (1.0, 2.0).Here is an example:model = SDDP.LinearPolicyGraph(\n            stages = 3, sense = :Min, lower_bound = 0.0,\n            optimizer = with_optimizer(GLPK.Optimizer)\n        ) do subproblem, t\n    @variable(subproblem, 0 <= volume <= 200, SDDP.State, initial_value = 200)\n    @variables(subproblem, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n        inflow\n    end)\n    @constraints(subproblem, begin\n        volume.out == volume.in + inflow - hydro_generation - hydro_spill\n        demand_constraint, thermal_generation + hydro_generation == 150.0\n    end)\n\n    SDDP.add_objective_state(\n            subproblem, initial_value = (50.0, 50.0),\n            lipschitz = (10_000.0, 10_000.0), lower_bound = (50.0, 50.0),\n            upper_bound = (150.0, 150.0)) do fuel_cost, ω\n        fuel_cost′ = fuel_cost[1] + 0.5 * (fuel_cost[1] - fuel_cost[2]) + ω.fuel\n        return (fuel_cost′, fuel_cost[1])\n    end\n\n    Ω = [\n        (fuel = f, inflow = w)\n        for f in [-10.0, -5.0, 5.0, 10.0] for w in [0.0, 50.0, 100.0]\n    ]\n\n    SDDP.parameterize(subproblem, Ω) do ω\n        (fuel_cost, fuel_cost_old) = SDDP.objective_state(subproblem)\n        @stageobjective(subproblem, fuel_cost * thermal_generation)\n        JuMP.fix(inflow, ω.inflow)\n    end\nend\n\nSDDP.train(model, iteration_limit = 10, run_numerical_stability_report=false)\n\nsimulations = SDDP.simulate(model, 1)\n\nprint(\"Finished training and simulating.\")\n\n# output\n\n-------------------------------------------------------\n         SDDP.jl (c) Oscar Dowson, 2017-19\n\n Iteration    Simulation       Bound         Time (s)\n        1    2.437500e+03   3.252498e+03   3.609998e-01\n        2    1.768750e+04   4.452948e+03   3.639998e-01\n        3    1.093750e+04   4.452948e+03   3.680000e-01\n        4    5.922800e+03   4.487193e+03   3.709998e-01\n        5    4.250000e+03   4.734739e+03   3.750000e-01\n        6    3.250000e+03   4.928394e+03   3.789999e-01\n        7    0.000000e+00   4.980352e+03   3.829999e-01\n        8   -8.526513e-12   4.980352e+03   3.859999e-01\n        9    1.750000e+03   4.980352e+03   3.899999e-01\n       10    3.000000e+03   4.980352e+03   3.939998e-01\n\nTerminating training with status: iteration_limit\n-------------------------------------------------------\nFinished training and simulating.This time, since our objective state is two-dimensional, the objective states are tuples with two elements:julia> [stage[:objective_state] for stage in simulations[1]]\n3-element Array{Tuple{Float64,Float64},1}:\n (55.0, 50.0)\n (52.5, 55.0)\n (56.25, 52.5)"
},

{
    "location": "tutorial/14_objective_states/#objective_state_warnings-1",
    "page": "Intermediate IV: objective states",
    "title": "Warnings",
    "category": "section",
    "text": "There are number of things to be aware of when using objective states.The key assumption is that price is independent of the states and actions in  the model.\nThat means that the price cannot appear in any @constraints. Nor can you  use any @variables in the update function.\nChoosing an appropriate Lipschitz constant is difficult.\nThe points discussed in Choosing an initial bound are relevant. The  Lipschitz constant should not be chosen as large as possible (since this  will help with convergence and the numerical issues discussed above), but if  chosen to small, it may cut of the feasible region and lead to a sub-optimal  solution.\nYou need to ensure that the cost-to-go function is concave with respect to  the objective state before the update.\nV(x y) = minY(y) x  Ax ge b\nIf the update function is linear, this is always the case. In some  situations, the update function can be nonlinear (e.g., multiplicative as we  have above). In general, placing constraints on the price (e.g.,  clamp(price, 0, 1)) will destroy concavity. Caveat  emptor. It\'s up to you if this  is a problem. If it isn\'t you\'ll get a good heuristic with no guarantee of  global optimality.In the next tutorial, Intermediate V: performance, we discuss how to improve the computational performance of SDDP.jl models."
},

{
    "location": "tutorial/15_performance/#",
    "page": "Intermediate V: performance",
    "title": "Intermediate V: performance",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/15_performance/#Intermediate-V:-performance-1",
    "page": "Intermediate V: performance",
    "title": "Intermediate V: performance",
    "category": "section",
    "text": "SDDP is a computationally intensive algorithm. In this tutorial, we give suggestions for how the computational performance can be improved."
},

{
    "location": "tutorial/15_performance/#Numerical-stability-(again)-1",
    "page": "Intermediate V: performance",
    "title": "Numerical stability (again)",
    "category": "section",
    "text": "We\'ve already discussed this in the Numerical stability section of Basic VI: words of warning. But, it\'s so important that we\'re going to say it again: improving the problem scaling is one of the best ways to improve the numerical performance of your models."
},

{
    "location": "tutorial/15_performance/#Solver-selection-1",
    "page": "Intermediate V: performance",
    "title": "Solver selection",
    "category": "section",
    "text": "The majority of the solution time is spent inside the low-level solvers. Choosing which solver (and the associated settings) correctly can lead to big speed-ups.Choose a commercial solver.\nOptions include CPLEX, Gurobi, and Xpress. Using free solvers such as CLP and GLPK isn\'t a viable approach for large problems.\nTry different solvers.Even commercial solvers can have wildly different solution times. We\'ve seen   models on which CPLEX was 50% fast than Gurobi, and vice versa.Experiment with different solver options.\nUsing the default settings is usually a good option. However, sometimes it can pay to change these. In particular, forcing solvers to use the dual simplex algorithm (e.g., Method=1 in Gurobi ) is usually a performance win."
},

{
    "location": "tutorial/15_performance/#Average-cut-vs-multi-cut-1",
    "page": "Intermediate V: performance",
    "title": "Average cut vs multi-cut",
    "category": "section",
    "text": "There are two competing ways that cuts can be created in SDDP: average cut and multi-cut. These can be specified as followsSDDP.train(model; cut_type = SDDP.AVERAGE_CUT)\nSDDP.train(model; cut_type = SDDP.MULTI_CUT)The performance of each method is problem-dependent. We recommend that you try both in order to see which one performs better. In general, the average cut method works better when the number of realizations of the stagewise-independent random variable is large."
},

{
    "location": "apireference/#",
    "page": "Reference",
    "title": "Reference",
    "category": "page",
    "text": ""
},

{
    "location": "apireference/#API-Reference-1",
    "page": "Reference",
    "title": "API Reference",
    "category": "section",
    "text": ""
},

{
    "location": "apireference/#SDDP.Graph",
    "page": "Reference",
    "title": "SDDP.Graph",
    "category": "type",
    "text": "Graph(root_node::T) where T\n\nCreate an empty graph struture with the root node root_node.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.add_node",
    "page": "Reference",
    "title": "SDDP.add_node",
    "category": "function",
    "text": "add_node(graph::Graph{T}, node::T) where T\n\nAdd a node to the graph graph.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.add_edge",
    "page": "Reference",
    "title": "SDDP.add_edge",
    "category": "function",
    "text": "add_node(graph::Graph{T}, node::T) where T\n\nAdd an edge to the graph graph.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.LinearGraph",
    "page": "Reference",
    "title": "SDDP.LinearGraph",
    "category": "function",
    "text": "LinearGraph(stages::Int)\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.MarkovianGraph",
    "page": "Reference",
    "title": "SDDP.MarkovianGraph",
    "category": "function",
    "text": "MarkovianGraph(transition_matrices::Vector{Matrix{Float64}})\n\n\n\n\n\nMarkovianGraph(; stages::Int,\n               transition_matrix::Matrix{Float64},\n               root_node_transition::Vector{Float64})\n\nConstruct a Markovian graph object.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.LinearPolicyGraph",
    "page": "Reference",
    "title": "SDDP.LinearPolicyGraph",
    "category": "function",
    "text": "LinearPolicyGraph(builder::Function; stages::Int, kwargs...)\n\nCreate a linear policy graph with stages number of stages.\n\nSee PolicyGraph for the other keyword arguments.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.MarkovianPolicyGraph",
    "page": "Reference",
    "title": "SDDP.MarkovianPolicyGraph",
    "category": "function",
    "text": "MarkovianPolicyGraph(builder::Function;\n    transition_matrices::Vector{Array{Float64, 2}}, kwargs...)\n\nCreate a Markovian policy graph based on the transition matrices given in transition_matrices.\n\nSee PolicyGraph for the other keyword arguments.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.PolicyGraph",
    "page": "Reference",
    "title": "SDDP.PolicyGraph",
    "category": "type",
    "text": "PolicyGraph(builder::Function, graph::Graph{T};\n            bellman_function = BellmanFunction,\n            optimizer = nothing,\n            direct_mode = true) where T\n\nConstruct a a policy graph based on the graph structure of graph. (See Graph for details.)\n\nExample\n\nfunction builder(subproblem::JuMP.Model, index)\n    # ... subproblem definition ...\nend\nmodel = PolicyGraph(builder, graph;\n                    bellman_function = BellmanFunction,\n                    optimizer = with_optimizer(GLPK.Optimizer),\n                    direct_mode = false)\n\nOr, using the Julia do ... end syntax:\n\nmodel = PolicyGraph(graph;\n                    bellman_function = BellmanFunction,\n                    optimizer = with_optimizer(GLPK.Optimizer),\n                    direct_mode = true) do subproblem, index\n    # ... subproblem definitions ...\nend\n\n\n\n\n\n"
},

{
    "location": "apireference/#Policy-graphs-1",
    "page": "Reference",
    "title": "Policy graphs",
    "category": "section",
    "text": "SDDP.Graph\nSDDP.add_node\nSDDP.add_edge\nSDDP.LinearGraph\nSDDP.MarkovianGraph\nSDDP.LinearPolicyGraph\nSDDP.MarkovianPolicyGraph\nSDDP.PolicyGraph"
},

{
    "location": "apireference/#SDDP.@stageobjective",
    "page": "Reference",
    "title": "SDDP.@stageobjective",
    "category": "macro",
    "text": "@stageobjective(subproblem, expr)\n\nSet the stage-objective of subproblem to expr.\n\nExample\n\n@stageobjective(subproblem, 2x + y)\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.parameterize",
    "page": "Reference",
    "title": "SDDP.parameterize",
    "category": "function",
    "text": "parameterize(modify::Function,\n             subproblem::JuMP.Model,\n             realizations::Vector{T},\n             probability::Vector{Float64} = fill(1.0 / length(realizations))\n                 ) where T\n\nAdd a parameterization function modify to subproblem. The modify function takes one argument and modifies subproblem based on the realization of the noise sampled from realizations with corresponding probabilities probability.\n\nIn order to conduct an out-of-sample simulation, modify should accept arguments that are not in realizations (but still of type T).\n\nExample\n\nSDDP.parameterize(subproblem, [1, 2, 3], [0.4, 0.3, 0.3]) do ω\n    JuMP.set_upper_bound(x, ω)\nend\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.add_objective_state",
    "page": "Reference",
    "title": "SDDP.add_objective_state",
    "category": "function",
    "text": "add_objective_state(update::Function, subproblem::JuMP.Model; kwargs...)\n\nAdd an objective state variable to subproblem.\n\nRequired kwargs are:\n\ninitial_value: The initial value of the objective state variable at the  root node.\nlipschitz: The lipschitz constant of the objective state variable.\n\nSetting a tight value for the lipschitz constant can significantly improve the speed of convergence.\n\nOptional kwargs are:\n\nlower_bound: A valid lower bound for the objective state variable. Can be  -Inf.\nupper_bound: A valid upper bound for the objective state variable. Can be  +Inf.\n\nSetting tight values for these optional variables can significantly improve the speed of convergence.\n\nIf the objective state is N-dimensional, each keyword argument must be an NTuple{N, Float64}. For example, initial_value = (0.0, 1.0).\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.objective_state",
    "page": "Reference",
    "title": "SDDP.objective_state",
    "category": "function",
    "text": "objective_state(subproblem::JuMP.Model)\n\n\n\n\n\n"
},

{
    "location": "apireference/#Subproblem-definition-1",
    "page": "Reference",
    "title": "Subproblem definition",
    "category": "section",
    "text": "@stageobjective\nSDDP.parameterize\nSDDP.add_objective_state\nSDDP.objective_state"
},

{
    "location": "apireference/#SDDP.numerical_stability_report",
    "page": "Reference",
    "title": "SDDP.numerical_stability_report",
    "category": "function",
    "text": "numerical_stability_report([io::IO=stdout,] model::PolicyGraph,\n                           by_node::Bool=false, print=true, warn::Bool=true)\n\nPrint a report identifying possible numeric stability issues.\n\nIf by_node, print a report for each node in the graph.\nIf print, print to io.\nIf warn, warn if the coefficients may cause numerical issues.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.train",
    "page": "Reference",
    "title": "SDDP.train",
    "category": "function",
    "text": "SDDP.train(model::PolicyGraph; kwargs...)\n\nTrain the policy of the model. Keyword arguments are\n\niteration_limit: number of iterations to conduct before termination\ntime_limit: number of seconds to train before termination\nprint_level: control the level of printing to the screen\nlog_file: filepath at which to write a log of the training progress\nrunnumericalstability_report: generate a numerical stability report prior to solve\nrisk_measure\nstoping_rules\nsampling_scheme: a sampling scheme to use on the forward pass of the algorithm. Defaults to InSampleMonteCarlo().\nrefineatsimilar_nodes\n\nThere is also a special option for infinite horizon problems\n\ncyclediscretizationdelta: the maximum distance between states allowed on the forward pass.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.termination_status",
    "page": "Reference",
    "title": "SDDP.termination_status",
    "category": "function",
    "text": "termination_status(model::PolicyGraph)\n\nQuery the reason why the training stopped.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.write_cuts_to_file",
    "page": "Reference",
    "title": "SDDP.write_cuts_to_file",
    "category": "function",
    "text": "write_cuts_to_file(model::PolicyGraph{T}, filename::String) where {T}\n\nWrite the cuts that form the policy in model to filename in JSON format.\n\nSee also SDDP.read_cuts_from_file.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.read_cuts_from_file",
    "page": "Reference",
    "title": "SDDP.read_cuts_from_file",
    "category": "function",
    "text": "read_cuts_from_file(\n    model::PolicyGraph{T}, filename::String;\n    node_name_parser::Function = _node_name_parser) where {T}\n\nRead cuts (saved using SDDP.write_cuts_to_file) from filename into model.\n\nSince T can be an arbitrary Julia type, the conversion to JSON is lossy. When reading, read_cuts_from_file only supports T=Int, T=NTuple{N, Int}, and T=Symbol. If you have manually created a policy graph with a different node type T, provide a function node_name_parser with the signature node_name_parser(T, name::String)::T where {T} that returns the name of each node given the string name name.\n\nSee also SDDP.write_cuts_to_file.\n\n\n\n\n\n"
},

{
    "location": "apireference/#Training-the-policy-1",
    "page": "Reference",
    "title": "Training the policy",
    "category": "section",
    "text": "SDDP.numerical_stability_report\nSDDP.train\nSDDP.termination_status\nSDDP.write_cuts_to_file\nSDDP.read_cuts_from_file"
},

{
    "location": "apireference/#SDDP.simulate",
    "page": "Reference",
    "title": "SDDP.simulate",
    "category": "function",
    "text": "simulate(model::PolicyGraph,\n         number_replications::Int = 1,\n         variables::Vector{Symbol} = Symbol[];\n         sampling_scheme::AbstractSamplingScheme =\n             InSampleMonteCarlo(),\n         custom_recorders = Dict{Symbol, Function}()\n )::Vector{Vector{Dict{Symbol, Any}}}\n\nPerform a simulation of the policy model with number_replications replications using the sampling scheme sampling_scheme.\n\nReturns a vector with one element for each replication. Each element is a vector with one-element for each node in the scenario that was sampled. Each element in that vector is a dictionary containing information about the subproblem that was solved.\n\nIn that dictionary there are four special keys:\n\n:node_index, which records the index of the sampled node in the policy model\n:noise_term, which records the noise observed at the node\n:stage_objective, which records the stage-objective of the subproblem\n:bellman_term, which records the cost/value-to-go of the node.\n\nThe sum of :stageobjective + :bellmanterm will equal the objective value of the solved subproblem.\n\nIn addition to the special keys, the dictionary will contain the result of JuMP.value(subproblem[key]) for each key in variables. This is useful to obtain the primal value of the state and control variables.\n\nFor more complicated data, the custom_recorders keyword arguement can be used.\n\ndata = Dict{Symbol, Any}()\nfor (key, recorder) in custom_recorders\n    data[key] = foo(subproblem)\nend\n\nFor example, to record the dual of a constraint named my_constraint, pass the following:\n\nsimulation_results = simulate(model, number_replications=2;\n    custom_recorders = Dict(\n        :constraint_dual = (sp) -> JuMP.dual(sp[:my_constraint])\n    )\n)\n\nThe value of the dual in the first stage of the second replication can be accessed as:\n\nsimulation_results[2][1][:constraint_dual]\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.calculate_bound",
    "page": "Reference",
    "title": "SDDP.calculate_bound",
    "category": "function",
    "text": "SDDP.calculate_bound(model::PolicyGraph, state::Dict{Symbol, Float64},\n                       risk_measure=Expectation())\n\nCalculate the lower bound (if minimizing, otherwise upper bound) of the problem model at the point state, assuming the risk measure at the root node is risk_measure.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.Historical",
    "page": "Reference",
    "title": "SDDP.Historical",
    "category": "type",
    "text": "Historical(scenarios::Vector{Vector{Tuple{T, S}}},\n           probability::Vector{Float64})\n\nA sampling scheme that samples a scenario from the vector of scenarios scenarios according to probability. If probability omitted, defaults to uniform probability.\n\nExample\n\nHistorical(\n    [\n        [(1, 0.5), (2, 1.0), (3, 0.5)],\n        [(1, 0.5), (2, 0.0), (3, 1.0)],\n        [(1, 1.0), (2, 0.0), (3, 0.0)]\n    ],\n    [0.2, 0.5, 0.3]\n)\n\n\n\n\n\nHistorical(scenario::Vector{Tuple{T, S}})\n\nA deterministic sampling scheme that always samples scenario with probability 1.\n\nExample\n\nHistorical([(1, 0.5), (2, 1.5), (3, 0.75)])\n\n\n\n\n\n"
},

{
    "location": "apireference/#Simulating-the-policy-1",
    "page": "Reference",
    "title": "Simulating the policy",
    "category": "section",
    "text": "SDDP.simulate\nSDDP.calculate_bound\nSDDP.Historical"
},

{
    "location": "apireference/#SDDP.SpaghettiPlot",
    "page": "Reference",
    "title": "SDDP.SpaghettiPlot",
    "category": "type",
    "text": "SDDP.SpaghettiPlot(; stages, scenarios)\n\nInitialize a new SpaghettiPlot with stages stages and scenarios number of replications.\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.add_spaghetti",
    "page": "Reference",
    "title": "SDDP.add_spaghetti",
    "category": "function",
    "text": "SDDP.add_spaghetti(data_function::Function, plt::SpaghettiPlot; kwargs...)\n\nDescription\n\nAdd a new figure to the SpaghettiPlot plt, where the y-value of the scenarioth line when x = stage is given by data_function(plt.simulations[scenario][stage]).\n\nKeyword arguments\n\nxlabel: set the xaxis label\nylabel: set the yaxis label\ntitle: set the title of the plot\nymin: set the minimum y value\nymax: set the maximum y value\ncumulative: plot the additive accumulation of the value across the stages\ninterpolate: interpolation method for lines between stages.\n\nDefaults to \"linear\" see the d3 docs 	for all options.\n\nExamples\n\nsimulations = simulate(model, 10)\nplt = SDDP.spaghetti_plot(simulations)\nSDDP.add_spaghetti(plt; title = \"Stage objective\") do data\n	return data[:stage_objective]\nend\n\n\n\n\n\n"
},

{
    "location": "apireference/#SDDP.publication_plot",
    "page": "Reference",
    "title": "SDDP.publication_plot",
    "category": "function",
    "text": "SDDP.publication_plot(\n    data_function, simulations;\n    quantile = [0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0],\n    kwargs...)\n\nCreate a Plots.jl recipe plot of the simulations.\n\nSee Plots.jl for the list of keyword arguments.\n\nExample\n\nSDDP.publication_plot(simulations; title = \"My title\") do data\n    return data[:stage_objective]\nend\n\n\n\n\n\n"
},

{
    "location": "apireference/#Visualizing-the-policy-1",
    "page": "Reference",
    "title": "Visualizing the policy",
    "category": "section",
    "text": "SDDP.SpaghettiPlot\nSDDP.add_spaghetti\nSDDP.publication_plot"
},

]}