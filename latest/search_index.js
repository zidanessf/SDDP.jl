var documenterSearchIndex = {"docs": [

{
    "location": "index.html#",
    "page": "Home",
    "title": "Home",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "index.html#SDDP.jl-Documentation-1",
    "page": "Home",
    "title": "SDDP.jl Documentation",
    "category": "section",
    "text": "SDDP.jl is a package for solving large multistage convex stochastic optimization problems using _stochastic dual dynamic programming_. In this manual, we\'re going to assume a reasonable amount of background knowledge about stochastic optimization, the SDDP algorithm, Julia, and JuMP.note: Note\nIf you don\'t have that background, you may want to brush up on some Readings.note: Note\nYou can find the old, terribly incomplete documentation at Old Manual."
},

{
    "location": "index.html#Getting-started-1",
    "page": "Home",
    "title": "Getting started",
    "category": "section",
    "text": "This package is unregistered so you will need to Pkg.clone it as follows:Pkg.clone(\"https://github.com/odow/SDDP.jl.git\")If you want to use the parallel features of SDDP.jl, you should start Julia with some worker processes (julia -p N), or add by running julia> addprocs(N) in a running Julia session.Once you\'ve got SDDP.jl installed, you should read some tutorials, beginnng with First steps."
},

{
    "location": "index.html#Citing-SDDP.jl-1",
    "page": "Home",
    "title": "Citing SDDP.jl",
    "category": "section",
    "text": "If you use SDDP.jl, we ask that you please cite the following paper:@article{dowson_sddp.jl,\n	title = {{SDDP}.jl: a {Julia} package for stochastic dual dynamic programming},\n	url = {http://www.optimization-online.org/DB_HTML/2017/12/6388.html},\n	journal = {Optimization Online},\n	author = {Dowson, Oscar and Kapelevich, Lea},\n	year = {2017}\n}"
},

{
    "location": "tutorial/first_example.html#",
    "page": "First steps",
    "title": "First steps",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/first_example.html#First-steps-1",
    "page": "First steps",
    "title": "First steps",
    "category": "section",
    "text": "Hydrothermal scheduling is the most common application of stochastic dual dynamic programming. To illustrate some of the basic functionality of SDDP.jl, we implement a very simple model of the hydrothermal scheduling problem.In this model, where are two generators: a thermal generator, and a hydro generator. The thermal generator has a short-run marginal cost of \\$50/MWh in the first stage, \\$100/MWh in the second stage, and \\$150/MWh in the third stage. The hydro generator has a short-run marginal cost of \\$0/MWh.We consider the problem of scheduling the generation over three time periods in order to meet a known demand of 150 MWh in each period.The hydro generator draws water from a reservoir which has a maximum capacity of 200 units. We assume that at the start of the first time period, the reservoir is full. In addition to the ability to generate electricity by passing water through the hydroelectric turbine, the hydro generator can also spill water down a spillway (bypassing the turbine) in order to prevent the water from over-topping the dam. We assume that there is no cost of spillage.The objective of the optimization is to minimize the expected cost of generation over the three time periods."
},

{
    "location": "tutorial/first_example.html#Formulating-the-problem-1",
    "page": "First steps",
    "title": "Formulating the problem",
    "category": "section",
    "text": "First, we need to load some packages. For this example, we are going to use the Clp.jl package; however, you are free to use any solver that you could normally use with JuMP.using SDDP, JuMP, ClpNext, we need to initialize our model. In our example, we are minimizing, there are three stages, and we know a lower bound of 0.0. Therefore, we can initialize our model using the SDDPModel constructor:m = SDDPModel(\n                  sense = :Min,          \n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0\n                                        ) do sp, t\n    # ... stuff to go here ...\nendIf you haven\'t seen the do sp, t ... end syntax before, this syntax is equivalent to the following:function define_subproblem(sp::JuMP.Model, t::Int)\n    # ... stuff to go here ...\nend\nm = SDDPModel(\n    define_subproblem,\n    sense           = :Min,          \n    stages          = 3,\n    solver          = ClpSolver(),\n    objective_bound = 0.0\n)The function define_subproblem (although you can call it anything you like) takes two arguments: sp, a JuMP.Model that we will use to build each subproblem; and t, an Int that is a counter from 1 to the number of stages. In this case, t=1, 2, 3. The sense, stages, and solver keyword arguments to SDDPModel should be obvious; however, the objective_bound is worth explaining.In order to solve a model using SDDP, we need to define a valid lower bound for every subproblem. (See Introduction to SDDP for details.) In this example, the least-cost solution is to meet demand entirely from the hydro generator, incurring a cost of \\$0/MWh. Therefore, we set objective_bound=0.0.Now we need to define build each subproblem using a mix of JuMP and SDDP.jl syntax."
},

{
    "location": "tutorial/first_example.html#State-variables-1",
    "page": "First steps",
    "title": "State variables",
    "category": "section",
    "text": "There is one state variable in our model: the quantity of water in the reservoir at the end of stage t. Two add this state variable to the model, SDDP.jl defines the @state macro.  This macro takes three arguments:sp - the JuMP model;\nan expression for the outgoing state variable; and\nan expression for the incoming state variable.The 2ⁿᵈ argument can be any valid JuMP @variable syntax and can include, for example, upper and lower bounds. The 3ʳᵈ argument must be the name of the incoming state variable, followed by ==, and then the value of the state variable at the root node of the policy graph. For our hydrothermal example, the state variable can be constructed as:@state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)"
},

{
    "location": "tutorial/first_example.html#Control-variables-1",
    "page": "First steps",
    "title": "Control variables",
    "category": "section",
    "text": "We now need to define some control variables. In SDDP.jl, control variables are just normal JuMP variables. Therefore, we can define the three variables in the hydrothermal scheduling problem (thermal generation, hydro generation, and the quantity of water to spill) as follows:@variables(sp, begin\n    thermal_generation >= 0\n    hydro_generation   >= 0\n    hydro_spill        >= 0\n end)"
},

{
    "location": "tutorial/first_example.html#Constraints-1",
    "page": "First steps",
    "title": "Constraints",
    "category": "section",
    "text": "Before we specify the constraints, we need to create some data. For this problem, we need the inflow to the reservoir in each stage t=1, 2, 3. Therefore, we create the vector:inflow = [50.0, 50.0, 50.0]The inflow in stage t can be accessed as inflow[t].First, we have the water balance constraint: the volume of water at the end of the stage must equal the volume of water at the start of the stage, plus any inflows, less that used for generation or spilled down the spillway.@constraint(sp,\n    incoming_volume + inflow[t] - hydro_generation - hydro_spill == outgoing_volume\n)Note that we use t defined by the SDDPModel constructor. There is also a constraint that total generation must equal demand of 150 MWh:@constraint(sp,\n    thermal_generation + hydro_generation == 150\n)"
},

{
    "location": "tutorial/first_example.html#The-stage-objective-1",
    "page": "First steps",
    "title": "The stage objective",
    "category": "section",
    "text": "Finally, there is a cost on thermal generation of \\$50/MWh in the first stage, \\$100/MWh in the second stage, and \\$150/MWh in the third stage. To add the stage-objective, we use the aptly named @stageobjective macro provided by SDDP.jl:if t == 1\n    @stageobjective(sp,  50.0 * thermal_generation )\nelseif t == 2\n    @stageobjective(sp, 100.0 * thermal_generation )\nelseif t == 3\n    @stageobjective(sp, 150.0 * thermal_generation )\nendinfo: Info\nif statements can be used more broadly in the subproblem definition to conditionally and variables and constraints into different subproblems.We can also implement the stage-objective more succinctly using a vector:fuel_cost = [50.0, 100.0, 150.0]\n@stageobjective(sp, fuel_cost[t] * thermal_generation )"
},

{
    "location": "tutorial/first_example.html#Solving-the-problem-1",
    "page": "First steps",
    "title": "Solving the problem",
    "category": "section",
    "text": "Putting all that we have discussed above together, we get:using SDDP, JuMP, Clp\nm = SDDPModel(\n                  sense = :Min,\n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0\n                                        ) do sp, t\n    @state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)\n    @variables(sp, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n     end)\n    inflow = [50.0, 50.0, 50.0]\n    @constraints(sp, begin\n        incoming_volume + inflow[t] - hydro_generation - hydro_spill == outgoing_volume\n        thermal_generation + hydro_generation == 150\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(sp, fuel_cost[t] * thermal_generation )\nendTo solve this problem, we use the solve method:status = solve(m; max_iterations=5)The return value status is a symbol describing why the SDDP algorithm terminated. In this case, the value is :max_iterations. We discuss other arguments to the solve method and other possible values for status in future sections of this manual.During the solve, the following log is printed to the screen.-------------------------------------------------------------------------------\n                          SDDP.jl © Oscar Dowson, 2017-2018\n-------------------------------------------------------------------------------\n    Solver:\n        Serial solver\n    Model:\n        Stages:         3\n        States:         1\n        Subproblems:    3\n        Value Function: Default\n-------------------------------------------------------------------------------\n              Objective              |  Cut  Passes    Simulations   Total\n     Simulation       Bound   % Gap  |   #     Time     #    Time    Time\n-------------------------------------------------------------------------------\n       15.000K         5.000K        |     1    0.0      0    0.0    0.0\n        5.000K         5.000K        |     2    0.0      0    0.0    0.0\n        5.000K         5.000K        |     3    0.0      0    0.0    0.0\n        5.000K         5.000K        |     4    0.0      0    0.0    0.0\n        5.000K         5.000K        |     5    0.0      0    0.0    0.0\n-------------------------------------------------------------------------------\n    Other Statistics:\n        Iterations:         5\n        Termination Status: max_iterations\n===============================================================================The header and footer of the output log contain self-explanatory statistics about the problem. The numeric columns are worthy of description. Each row corresponds to one iteration of the SDDP algorithm.The left half of the log relates to the objective of the problem. In the _Simulation_ column, we give the cumulative cost of each forward pass. In the _Bound_ column, we give the lower bound (upper if maximizing) obtained after the backward pass has completed in each iteration. Ignore the _% Gap_ column for now, that is addressed in Tutorial RHS noise.The right half of the log displays timing statistics. _Cut Passes_ displays the number of cutting iterations conducted (in _#_) and the time it took to (in _Time_). Ignore the _Simulations_ columns for now, they are addressed in Tutorial RHS noise. Finally, the _Total Time_ column records the total time spent solving the problem.This log can be silenced by setting the print_level keyword argument to solve to 0. In addition, the log will be written to the file given by the log_file keyword argument (this is off by default)."
},

{
    "location": "tutorial/first_example.html#Understanding-the-solution-1",
    "page": "First steps",
    "title": "Understanding the solution",
    "category": "section",
    "text": "The first thing we want to do is to query the lower (upper if maximizing) bound of the solution. This can be done via the getbound function:getbound(m)This returns the value of the Bound_ column in the last row in the output table above. In this example, the bound is 5000.0.Then, we can perform a Monte Carlo simulation of the policy using the simulate function. It takes three arguments. The first is the SDDPModel m. The second is the number of replications to perform. The third is a vector of variable names to record the value of at each stage and replication. Since our example is deterministic, it is sufficient to perform a single replication:simulation_result = simulate(m,\n    1,\n    [:outgoing_volume, :thermal_generation, :hydro_generation, :hydro_spill]\n)The return value, simulation_result, is a vector of dictionaries containing one element for each Monte Carlo replication. In this case, length(simulation_result) = 1. The keys of the dictionary are the variable symbols given in the simulate function, and their associated values are vectors, with one element for each stage, or the variable value in the simulated solution. For example, we can query the optimal quantity of hydro generation in each stage as follows:julia> simulation_result[1][:hydro_generation]\n3-element Array{Any, 1}:\n  50.0\n 150.0\n 150.0This concludes our first very simple tutorial for SDDP.jl. In the next tutorial, RHS noise, we introduce stagewise-independent noise into the model."
},

{
    "location": "tutorial/rhs_noise.html#",
    "page": "RHS noise",
    "title": "RHS noise",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/rhs_noise.html#RHS-noise-1",
    "page": "RHS noise",
    "title": "RHS noise",
    "category": "section",
    "text": "In the previous tutorial, First steps, we formulated a simple hydrothermal scheduling problem. In this tutorial, we extend the model to include stagewise-independent noise in the right-hand side of the constraints.note: Note\nNotably, SDDP.jl does not allow stagewise-independent noise terms in the constraint matrix. However, this can be modelled using a Markovian policy graph like the one in Markovian policy graphs.Recall that our model for the hydrothermal scheduling problem  from First steps is:m = SDDPModel(\n                  sense = :Min,\n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0\n                                        ) do sp, t\n    @state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)\n    @variables(sp, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n     end)\n    inflow = [50.0, 50.0, 50.0]\n    @constraints(sp, begin\n        incoming_volume + inflow[t] - hydro_generation - hydro_spill == outgoing_volume\n        thermal_generation + hydro_generation == 150\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(sp, fuel_cost[t] * thermal_generation )\nend"
},

{
    "location": "tutorial/rhs_noise.html#Formulating-the-problem-1",
    "page": "RHS noise",
    "title": "Formulating the problem",
    "category": "section",
    "text": "In this tutorial, we are going to model inflows that are stagewise-independent. Specifically, we assume that in each stage, there is an even probability of sampling an inflow of 0.0, 50.0, or 100.0. To add this noise term to the model, we need to use the @rhsnoise macro provided by SDDP.jl.@rhsnoise is similar to the JuMP @constraint macro. It takes three arguments. The first is the subproblem sp. The second argument is of the form name=[realizations], where name is a descriptive name, and realizations is a vector of elements in the sample space. The third argument is any valid JuMP constraint that utilizes name in the right-hand side. For our example, we have:@rhsnoise(sp, inflow = [0.0, 50.0, 100.0],\n    outgoing_volume - (incoming_volume - hydro_generation - hydro_spill) == inflow\n)However, the realizations do not have to be the full right-hand side term. The following is also valid:inflows = [0.0, 50.0, 100.0]\n@rhsnoise(sp, i = [1,2,3],\n    outgoing_volume - (incoming_volume - hydro_generation - hydro_spill) == inflows[i]\n)We can set the probabilitiy of sampling each element in the sample space using the setnoiseprobability! function. If setnoiseprobability! isn\'t called, the distribution is assumed to be uniform. Despite this, for the sake of completeness, we set the probability for our example as:setnoiseprobability!(sp, [1/3, 1/3, 1/3])Our model is now:m = SDDPModel(\n                  sense = :Min,\n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0\n                                        ) do sp, t\n    @state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)\n    @variables(sp, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n    end)\n    @rhsnoise(sp, inflow = [0.0, 50.0, 100.0],\n        outgoing_volume - (incoming_volume - hydro_generation - hydro_spill) == inflow\n    )\n    setnoiseprobability!(sp, [1/3, 1/3, 1/3])\n    @constraints(sp, begin\n        thermal_generation + hydro_generation == 150\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(sp, fuel_cost[t] * thermal_generation )\nend"
},

{
    "location": "tutorial/rhs_noise.html#Solving-the-problem-1",
    "page": "RHS noise",
    "title": "Solving the problem",
    "category": "section",
    "text": "Now we need to solve the problem. As in the First steps tutorial, we use the solve function. However, this time we utilize some additional arguments.Since our problem is stochastic, we often want to simulate the policy in order to estimate the upper (lower if maximizing) bound. This can be controlled via the simulation keyword to solve. The syntax has a lot going on so we\'re going to give an example of how it is used, and then walk through the different components.status = solve(m,\n    simulation = MonteCarloSimulation(\n        frequency   = 2,\n        confidence  = 0.95,\n        termination = true\n        min         = 50,\n        step        = 50,\n        max         = 100,\n    )\n)First, the frequency argument specifies how often the  Monte Carlo simulation is conducted (iterations/simulation). For this example, we conduct a Monte Carlo simulation every two iterations. Second, the confidence specifies the level at which to conduct the confidence interval. In this example, we construct a 95% confidence interval. Third, the termination argument is a Boolean defining if we should terminate the method if the lower limit of the confidence interval is less than the lower bound (upper limit and bound for maximization problems). The final three arguments implement the method of _sequential sampling_: min gives the minimum number of replications to conduct before the construction of a confidence interval. If there is evidence of convergence, another step replications are conducted. This continues until either: (1) max number of replications have been conducted; or (2) there is no evidence of convergence. For our example, we conduct 50 replications, and if there is no evidence of convergence, we conduct another 50 replications.The output from the log is now:-------------------------------------------------------------------------------\n                          SDDP.jl © Oscar Dowson, 2017-2018\n-------------------------------------------------------------------------------\n    Solver:\n        Serial solver\n    Model:\n        Stages:         3\n        States:         1\n        Subproblems:    3\n        Value Function: Default\n-------------------------------------------------------------------------------\n              Objective              |  Cut  Passes    Simulations   Total\n     Simulation       Bound   % Gap  |   #     Time     #    Time    Time\n-------------------------------------------------------------------------------\n       17.500K         3.438K        |     1    0.0      0    0.0    0.0\n   7.606K   10.894K    7.500K   1.4  |     2    0.0     50    0.0    0.0\n        7.500K         8.333K        |     3    0.0     50    0.0    0.0\n   7.399K    9.651K    8.333K -11.2  |     4    0.0    150    0.1    0.1\n-------------------------------------------------------------------------------\n    Other Statistics:\n        Iterations:         4\n        Termination Status: converged\n===============================================================================Compared with the log of a solve without using the simulation keyword, a few things have changed. First, in the second and fourth rows (i.e., the iterations in which a Monte Carlo simulation was conducted) the _Simulation_ column now gives two values. This pair is the confidence interval for the estimate of the upper bound.Second, in iterations in which a Monte Carlo simulation is conducted, there is an entry in the _% Gap_ column. This gaps measures the difference between the lower limit of the simulated confidence interval and the lower bound (given in the _Bound_) column. If the gap is positive, there is evidence that the model has not converged. Once the gap is negative, the lower bound lies above the lower limit of the confidence interval and we can terminate the algorithm.The third difference is that the _Simulations_ column now records the number of Monte Replications conducted to estimate the upper bound (in _#_) and time performing those Monte Carlo replications (in _Time_). You can use this information to tune the frequency at which the policy is tested for convergence.Also observe that the first time we performed the Monte Carlo simulation, we only conducted 50 replications; however, the second time we conducted 100. This demonstrates the _sequential sampling_ method at work.Finally, the termination status is now :converged instead of :max_iterations."
},

{
    "location": "tutorial/rhs_noise.html#Understanding-the-solution-1",
    "page": "RHS noise",
    "title": "Understanding the solution",
    "category": "section",
    "text": "The first thing we want to do is to query the lower (upper if maximizing) bound of the solution. This can be done via the getbound function:getbound(m)This returns the value of the Bound_ column in the last row in the output table above. In this example, the bound is 8333.0.Then, we can perform a Monte Carlo simulation of the policy using the simulate function. We perform 500 replications and record the same variables as we did in First steps.simulation_result = simulate(m,\n    500,\n    [:outgoing_volume, :thermal_generation, :hydro_generation, :hydro_spill]\n)This time, length(simulation_result) = 500. In addition to the variables, we also record some additional fields. This includes :stageobjective, the value of the stage-objective in each stage. We can calculate the cumulative objective of each replication by summing the stage-objectives as follows:julia> sum(simulation_result[100][:stageobjective])\n2500.0We can calculate the objective of all of each replication using Julia\'s generator syntax:julia> objectives = [sum(replication[:stageobjective]) for replication in simulation_result]\n500-element Array{Float64, 1}:\n  5000.0\n 20000.0\n 15000.0\n ⋮Then, we can calculate the mean and standard deviation of these objectives:julia> mean(objectives), std(objectives)\n(8025.0, 5567.66)We can query the noise that was sampled in each stage using the :noise key. This returns the index of the noise from the vector of realizations. For example:julia> simulation_result[100][:noise]\n3-element Array{Int, 1}:\n 1\n 3\n 2This concludes our second tutorial for SDDP.jl. In the next tutorial, Objective noise, we introduce stagewise-independent noise into the objective function."
},

{
    "location": "tutorial/objective_noise.html#",
    "page": "Objective noise",
    "title": "Objective noise",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/objective_noise.html#Objective-noise-1",
    "page": "Objective noise",
    "title": "Objective noise",
    "category": "section",
    "text": "In our first tutorial, First steps, we formulated a simple, deterministic hydrothermal scheduling problem. Then, in the previous tutorial, RHS noise, we extended this model to include stagewise-independent noise to the right-hand side of a constraint. Now, in this tutorial, we extend the model to include stagewise-independent noise in the objective function.note: Note\nNotably, SDDP.jl does not allow stagewise-independent noise terms in the constraint matrix. However, this can be modelled using a Markovian policy graph like the one in Markovian policy graphs.Recall that our model for the hydrothermal scheduling problem  from RHS noise is:m = SDDPModel(\n                  sense = :Min,\n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0\n                                        ) do sp, t\n    @state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)\n    @variables(sp, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n    end)\n    @rhsnoise(sp, inflow = [0.0, 50.0, 100.0],\n        outgoing_volume - (incoming_volume - hydro_generation - hydro_spill) == inflow\n    )\n    setnoiseprobability!(sp, [1/3, 1/3, 1/3])\n    @constraints(sp, begin\n        thermal_generation + hydro_generation == 150\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(sp, fuel_cost[t] * thermal_generation )\nend"
},

{
    "location": "tutorial/objective_noise.html#Formulating-the-problem-1",
    "page": "Objective noise",
    "title": "Formulating the problem",
    "category": "section",
    "text": "In this tutorial, we are going to model the fuel cost of the thermal generator by a stagewise-independent process. Specifically, we assume that in each stage, there is an even probability of sampling a fuel cost of 80%, 100%, or 120% of the usual fuel costs of \\$50/MWh in the first stage, \\$100/MWh in the second stage, and \\$150/MWh in the third stage. To add this noise term to the model, we need to use a modified version of the @stageobjective macro provided by SDDP.jl.This version of @stageobjective is similar to the @rhsnoise macro that we discussed in RHS noise. It takes three arguments. The first is the subproblem sp. The second argument is of the form name=[realizations], where name is a descriptive name, and realizations is a vector of elements in the sample space. The third argument is any valid input to the normal @stageobjective macro.It is important to note that there must be the same number of realizations in the objective as there are realizations in the right-hand-side random variable (created using @rhsnoise). The two noise terms will be sampled in unison, so that when the first element of the right-hand side noise is sampled, so to will the first element of the objective noise. If the two noise terms should be sampled independently, the user should form the Cartesian product.For our example, the price multiplier and the inflows are negatively correlated. Therefore, when inflow=0.0, the multiplier is 1.2, when inflow=50.0, the multiplier is 1.0, and when inflow=100.0, the multiplier is 0.8. Thus, we have:fuel_cost = [50.0, 100.0, 150.0]\n@stageobjective(sp, mupliplier = [1.2, 1.0, 0.8],\n    mupliplier * fuel_cost[t] * thermal_generation\n)As in RHS noise, the noise terms are sampled using the probability distribution set by the setnoiseprobability! function.Our model is now:m = SDDPModel(\n                  sense = :Min,\n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0\n                                        ) do sp, t\n    @state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)\n    @variables(sp, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n    end)\n    @rhsnoise(sp, inflow = [0.0, 50.0, 100.0],\n        outgoing_volume - (incoming_volume - hydro_generation - hydro_spill) == inflow\n    )\n    setnoiseprobability!(sp, [1/3, 1/3, 1/3])\n    @constraints(sp, begin\n        thermal_generation + hydro_generation == 150\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(sp, mupliplier = [1.2, 1.0, 0.8],\n        mupliplier * fuel_cost[t] * thermal_generation\n    )\nend"
},

{
    "location": "tutorial/objective_noise.html#Solving-the-problem-1",
    "page": "Objective noise",
    "title": "Solving the problem",
    "category": "section",
    "text": "Now we need to solve the problem. As in the previous two tutorials, we use the solve function. However, this time we use the bound stalling stopping rule. This can be controlled via the bound_convergence keyword to solve. The syntax has a lot going on so we\'re going to give an example of how it is used, and then walk through the different components.status = solve(m,\n    bound_convergence = BoundConvergence(\n        iterations = 5,\n        rtol       = 0.0,\n        atol       = 1e-6\n    )\n)First, the iterations argument specifies how many iterations that the bound must change by less than atol or rtol before terminating. For this example, we choose to terminate the SDDP algorithm after the bound has failed to improve for 5 iterations. Second, the rtol and atol keywords determine the absolute and relative tolerances by which we compare the equality of the bound in consecutive iterations. In this case, since the model is simple we choose an absolute convergence tolerance of 1e-6.The termination status is :bound_convergence, and the output from the log is now:-------------------------------------------------------------------------------\n                          SDDP.jl © Oscar Dowson, 2017-2018\n-------------------------------------------------------------------------------\n    Solver:\n        Serial solver\n    Model:\n        Stages:         3\n        States:         1\n        Subproblems:    3\n        Value Function: Default\n-------------------------------------------------------------------------------\n              Objective              |  Cut  Passes    Simulations   Total\n     Simulation       Bound   % Gap  |   #     Time     #    Time    Time\n-------------------------------------------------------------------------------\n        7.500K         5.733K        |     1    0.0      0    0.0    0.0\n       11.800K         8.889K        |     2    0.0      0    0.0    0.0\n       14.000K         9.167K        |     3    0.0      0    0.0    0.0\n       11.000K         9.167K        |     4    0.0      0    0.0    0.0\n        9.000K         9.167K        |     5    0.0      0    0.0    0.0\n        2.000K         9.167K        |     6    0.0      0    0.0    0.0\n       14.000K         9.167K        |     7    0.0      0    0.0    0.0\n-------------------------------------------------------------------------------\n    Other Statistics:\n        Iterations:         7\n        Termination Status: bound_convergence\n==============================================================================="
},

{
    "location": "tutorial/objective_noise.html#Understanding-the-solution-1",
    "page": "Objective noise",
    "title": "Understanding the solution",
    "category": "section",
    "text": "Instead of performing a Monte Carlo simulation, you may want to simulate one particular sequence of noise realizations. This _historical_ simulation can also be conducted using the simulate function.simulation_result = simulate(m,\n    [:outgoing_volume, :thermal_generation, :hydro_generation, :hydro_spill],\n    noises = [1, 1, 3]\n)This time, simulation_result is a single dictionary. We can query the objective of the simulation as follows:julia> simulation_result[:objective]\n9000.0Interestingly, despite sampling the low-inflow, high-price realization in the first stage, the model generates 150 MWh at a price of \\$60/MWh:julia> simulation_result[:thermal_generation]\n3-element Array{Any, 1}:\n 150.0\n   0.0\n   0.0This concludes our third tutorial for SDDP.jl. In the next tutorial, Markovian policy graphs, we introduce stagewise-dependent noise via a Markov chain."
},

{
    "location": "tutorial/markovian_policygraphs.html#",
    "page": "Markovian policy graphs",
    "title": "Markovian policy graphs",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/markovian_policygraphs.html#Markovian-policy-graphs-1",
    "page": "Markovian policy graphs",
    "title": "Markovian policy graphs",
    "category": "section",
    "text": "In our three tutorials (First steps, RHS noise, and Objective noise), we formulated a simple hydrothermal scheduling problem with stagewise-independent noise in the right-hand side of the constraints and in the objective function. Now, in this tutorial, we introduce some _stagewise-dependent_ uncertainty using a Markov chain.Recall that our model for the hydrothermal scheduling problem  from RHS noise is:m = SDDPModel(\n                  sense = :Min,\n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0\n                                        ) do sp, t\n    @state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)\n    @variables(sp, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n    end)\n    @rhsnoise(sp, inflow = [0.0, 50.0, 100.0],\n        outgoing_volume - (incoming_volume - hydro_generation - hydro_spill) == inflow\n    )\n    setnoiseprobability!(sp, [1/3, 1/3, 1/3])\n    @constraints(sp, begin\n        thermal_generation + hydro_generation == 150\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(sp, mupliplier = [1.2, 1.0, 0.8],\n        mupliplier * fuel_cost[t] * thermal_generation\n    )\nend"
},

{
    "location": "tutorial/markovian_policygraphs.html#Formulating-the-problem-1",
    "page": "Markovian policy graphs",
    "title": "Formulating the problem",
    "category": "section",
    "text": "In this tutorial we consider a Markov chain with two _climate_ states: wet and dry. Each Markov state is associated with an integer, in this case the wet climate state  is Markov state 1 and the dry climate state is Markov state 2. In the wet climate state, the probability of the high inflow increases to 50%, and the probability of the low inflow decreases to 1/6. In the dry climate state, the converse happens. There is also persistence in the climate state: the probability of remaining in the current state is 75%, and the probability of transitioning to the other climate state is 25%. We assume that the first stage starts in the _wet_ climate state.For each stage, we need to provide a Markov transition matrix. This is an MxN matrix, where the element A[i,j] gives the probability of transitioning from Markov state i in the previous stage to Markov state j in the current stage. The first stage is special because we assume there is a \"zero\'th\" stage which has one Markov state. Furthermore, the number of columns in the transition matrix of a stage (i.e., the number of Markov states) must equal the number of rows in the next stage\'s transition matrix. For our example, the vector of Markov transition matrices is given by:T = Array{Float64, 2}[\n    [ 1.0 0.0 ],\n    [ 0.75 0.25 ; 0.25 0.75 ],\n    [ 0.75 0.25 ; 0.25 0.75 ]\n]However, note that we never sample the dry Markov state in stage one. Therefore, we can drop that Markov state so that there is only one Markov state in stage 1. We also need to modify the transition matrix in stage 2 to account for this:T = Array{Float64, 2}[\n    [ 1.0 ]\',\n    [ 0.75 0.25 ],\n    [ 0.75 0.25 ; 0.25 0.75 ]\n]To add the Markov chain to the model, we modifications are required. First, we give the vector of transition matrices to the SDDPModel constructor using the markov_transition keyword. Second, the do sp, t ... end syntax is extended to do sp, t, i ... end, where i is the index of the Markov state and runs from i=1 to the number of Markov states in stage t. Now, both t and i can be used anywhere inside the subproblem definition.Our model is now:m = SDDPModel(\n                  sense = :Min,\n                 stages = 3,\n                 solver = ClpSolver(),\n        objective_bound = 0.0,  \n      markov_transition = Array{Float64, 2}[\n          [ 1.0 ]\',\n          [ 0.75 0.25 ],\n          [ 0.75 0.25 ; 0.25 0.75 ]\n      ]\n                                        ) do sp, t, i\n    @state(sp, 0 <= outgoing_volume <= 200, incoming_volume == 200)\n    @variables(sp, begin\n        thermal_generation >= 0\n        hydro_generation   >= 0\n        hydro_spill        >= 0\n    end)\n    @rhsnoise(sp, inflow = [0.0, 50.0, 100.0],\n        outgoing_volume - (incoming_volume - hydro_generation - hydro_spill) == inflow\n    )\n    @constraints(sp, begin\n        thermal_generation + hydro_generation == 150\n    end)\n    fuel_cost = [50.0, 100.0, 150.0]\n    @stageobjective(sp, mupliplier = [1.2, 1.0, 0.8],\n        mupliplier * fuel_cost[t] * thermal_generation\n    )\n    if i == 1  # wet climate state\n        setnoiseprobability!(sp, [1/6, 1/3, 0.5])\n    else       # dry climate state\n        setnoiseprobability!(sp, [0.5, 1/3, 1/6])\n    end\nend"
},

{
    "location": "tutorial/markovian_policygraphs.html#Solving-the-problem-1",
    "page": "Markovian policy graphs",
    "title": "Solving the problem",
    "category": "section",
    "text": "Now we need to solve the problem. As in the previous two tutorials, we use the solve function. However, this time we terminate the SDDP algorithm by setting a time limit (in seconds) using the time_limit keyword:status = solve(m,\n    time_limit = 0.05\n)The termination status is :time_limit, and the output from the log is now:-------------------------------------------------------------------------------\n                          SDDP.jl © Oscar Dowson, 2017-2018\n-------------------------------------------------------------------------------\n    Solver:\n        Serial solver\n    Model:\n        Stages:         3\n        States:         1\n        Subproblems:    3\n        Value Function: Default\n-------------------------------------------------------------------------------\n              Objective              |  Cut  Passes    Simulations   Total\n     Simulation       Bound   % Gap  |   #     Time     #    Time    Time\n-------------------------------------------------------------------------------\n        0.000          6.198K        |     1    0.0      0    0.0    0.0\n        2.000K         7.050K        |     2    0.0      0    0.0    0.0\n        2.000K         7.050K        |     3    0.0      0    0.0    0.0\n        2.000K         7.135K        |     4    0.0      0    0.0    0.0\n        5.000K         7.135K        |     5    0.0      0    0.0    0.0\n        2.000K         7.135K        |     6    0.0      0    0.0    0.0\n        2.000K         7.135K        |     7    0.0      0    0.0    0.0\n        2.000K         7.135K        |     8    0.0      0    0.0    0.0\n        2.000K         7.135K        |     9    0.0      0    0.0    0.0\n        9.000K         7.135K        |    10    0.0      0    0.0    0.0\n        2.000K         7.135K        |    11    0.0      0    0.0    0.0\n        5.000K         7.135K        |    12    0.1      0    0.0    0.1\n-------------------------------------------------------------------------------\n    Other Statistics:\n        Iterations:         12\n        Termination Status: time_limit\n==============================================================================="
},

{
    "location": "tutorial/markovian_policygraphs.html#Understanding-the-solution-1",
    "page": "Markovian policy graphs",
    "title": "Understanding the solution",
    "category": "section",
    "text": "Instead of performing a Monte Carlo simulation, you may want to simulate one particular sequence of noise realizations. This _historical_ simulation can also be conducted using the simulate function.simulation_result = simulate(m,\n    [:outgoing_volume, :thermal_generation, :hydro_generation, :hydro_spill],\n    noises       = [1, 1, 3],\n    markovstates = [1, 2, 2]\n)Again, simulation_result is a single dictionary. In addition to the variable values and the special keys :noise, :objective, and :stageobjective, SDDP.jl also records the index of the Markov state in each stage via the :markov key. We can confirm that the historical sequence of Markov states was visited as follows:julia> simulation_result[:markov]\n3-element Array{Int, 1}:\n 1\n 2\n 2This concludes our fourth tutorial for SDDP.jl. In the next tutorial, Risk, we introduce risk into the problem."
},

{
    "location": "tutorial/risk.html#",
    "page": "Risk",
    "title": "Risk",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/risk.html#Risk-1",
    "page": "Risk",
    "title": "Risk",
    "category": "section",
    "text": ""
},

{
    "location": "tutorial/cut_selection.html#",
    "page": "Cut Selection",
    "title": "Cut Selection",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/cut_selection.html#Cut-Selection-1",
    "page": "Cut Selection",
    "title": "Cut Selection",
    "category": "section",
    "text": ""
},

{
    "location": "readings.html#",
    "page": "Readings",
    "title": "Readings",
    "category": "page",
    "text": ""
},

{
    "location": "readings.html#Readings-1",
    "page": "Readings",
    "title": "Readings",
    "category": "section",
    "text": "On this page, we\'ve collated a variety of papers and books we think are helpful readings that cover knowledge needed to use SDDP.jl."
},

{
    "location": "readings.html#Stochastic-Optimization-1",
    "page": "Readings",
    "title": "Stochastic Optimization",
    "category": "section",
    "text": "A general primer on Stochastic ProgrammingBirge, J.R., Louveaux, F., 2011. Introduction to Stochastic Programming,  Springer Series in Operations Research and Financial Engineering. Springer New  York, New York, NY.  doi:10.1007/978-1-4614-0237-4Some overviews of Stochastic Optimization and where it sits in relation to other fieldsPowell, W.B., 2014. Clearing the Jungle of Stochastic Optimization, in: Newman,  A.M., Leung, J., Smith, J.C., Greenberg, H.J. (Eds.), Bridging Data and  Decisions. INFORMS, pp. 109–137. link\nPowell, W.B., 2016. A Unified Framework for Optimization under Uncertainty  TutORials in Operations Research, in: Optimization Challenges in Complex,  Networked and Risky Systems. pp. 45–83. link"
},

{
    "location": "readings.html#Stochastic-Dual-Dynamic-Programming-1",
    "page": "Readings",
    "title": "Stochastic Dual Dynamic Programming",
    "category": "section",
    "text": "The original paper presenting SDDPPereira, M.V.F., Pinto, L.M.V.G., 1991. Multi-stage stochastic optimization  applied to energy planning. Mathematical Programming 52, 359–375. doi:10.1007/BF01582895The paper presenting the Markov version of SDDP implemented in this libraryPhilpott, A.B., de Matos, V.L., 2012. Dynamic sampling algorithms for multi-stage  stochastic programs with risk aversion. European Journal of Operational Research  218, 470–483. doi:10.1016/j.ejor.2011.10.056"
},

{
    "location": "readings.html#SDDP.jl-1",
    "page": "Readings",
    "title": "SDDP.jl",
    "category": "section",
    "text": "Two papers about SDDP.jlDowson, O., Kapelevich, L. (2017). SDDP.jl: a Julia package for Stochastic   Dual Dynamic Programming. Optimization Online. link\nDownward, A., Dowson, O., and Baucke, R. (2018). On the convergence of a   cutting plane method for multistage stochastic programming problems with   stagewise dependent price uncertainty. Optimization Online. link"
},

{
    "location": "readings.html#Julia-1",
    "page": "Readings",
    "title": "Julia",
    "category": "section",
    "text": "The organisation\'s websitehttps://julialang.org/The paper describing JuliaBezanson, J., Edelman, A., Karpinski, S., Shah, V.B., 2017. Julia: A Fresh  Approach to Numerical Computing. SIAM Review 59, 65–98. doi:10.1137/141000671"
},

{
    "location": "readings.html#JuMP-1",
    "page": "Readings",
    "title": "JuMP",
    "category": "section",
    "text": "Source code on Githubhttps://www.github.com/JuliaOpt/JuMP.jlThe paper describing JuMPDunning, I., Huchette, J., Lubin, M., 2017. JuMP: A Modeling Language for  Mathematical Optimization. SIAM Review 59, 295–320. doi:10.1137/15M1020575"
},

{
    "location": "oldindex.html#",
    "page": "Old Manual",
    "title": "Old Manual",
    "category": "page",
    "text": ""
},

{
    "location": "oldindex.html#Old-Manual-1",
    "page": "Old Manual",
    "title": "Old Manual",
    "category": "section",
    "text": ""
},

{
    "location": "oldindex.html#Types-of-problems-SDDP.jl-can-solve-1",
    "page": "Old Manual",
    "title": "Types of problems SDDP.jl can solve",
    "category": "section",
    "text": "To start, lets discuss the types of problems SDDP.jl can solve, since it has a few features that are non-standard, and it is missing some features that are standard.SDDP.jl can solve multi-stage convex stochastic optimizations problems witha finite discrete number of states;\ncontinuous state and control variables;\nHazard-Decision (Wait-and-See) uncertainty realization;\nstagewise independent uncertainty in the RHS of the constraints that is  drawn from a finite discrete distribution;\nstagewise independent uncertainty in the objective function that is  drawn from a finite discrete distribution;\na markov chain for temporal dependence. The markov chain forms a directed,  acyclic, feed-forward graph with a finite (and at least one) number of  markov states in each stage.note: Note\nStagewise independent uncertainty in the constraint coefficients is not supported. You should reformulate the problem, or model the uncertainty as a markov chain."
},

{
    "location": "oldindex.html#Formulating-the-problem-1",
    "page": "Old Manual",
    "title": "Formulating the problem",
    "category": "section",
    "text": "... still to do ...For now, go look at the examples."
},

{
    "location": "oldindex.html#The-Asset-Management-Problem-1",
    "page": "Old Manual",
    "title": "The Asset Management Problem",
    "category": "section",
    "text": "The goal of the asset management problem is to choose an investment portfolio that is composed of stocks and bonds in order to meet a target wealth goal at the end of the time horizon. After five, and ten years, the agent observes the portfolio and is able to re-balance their wealth between the two asset classes. As an extension to the original problem, we introduce two new random variables. The first that represents a source of additional wealth in years 5 and 10. The second is an immediate reward that the agent incurs for holding stocks at the end of years 5 and 10. This can be though of as a dividend that cannot be reinvested."
},

{
    "location": "oldindex.html#Communicating-the-problem-to-the-solver-1",
    "page": "Old Manual",
    "title": "Communicating the problem to the solver",
    "category": "section",
    "text": "The second step in the optimization process is communicating the problem to the solver. To do this, we are going to build each subproblem as a JuMP model, and provide some metadata that describes how the JuMP subproblems inter-relate."
},

{
    "location": "oldindex.html#The-Model-Constructor-1",
    "page": "Old Manual",
    "title": "The Model Constructor",
    "category": "section",
    "text": "The core type of SDDP.jl is the SDDPModel object. It can be constructed withm = SDDPModel( ... metadata as keyword arguments ... ) do sp, t, i\n    ... JuMP subproblem definition ...\nendWe draw the readers attention to three sections in the SDDPModel constructor."
},

{
    "location": "oldindex.html#Keyword-Metadata-1",
    "page": "Old Manual",
    "title": "Keyword Metadata",
    "category": "section",
    "text": "For a comprehensive list of options, checkout SDDPModel or type julia> ? SDDPModel into a Julia REPL. However, we\'ll briefly list the important ones here.Required Keyword argumentsstages::Int: the number of stages in the problem. A stage is defined as  each step in time at which a decion can be made. Defaults to 1.\nobjective_bound: a valid bound on the initial value/cost to go. i.e. for maximisation this may be some large positive number, for minimisation this may be some large negative number. You can ether pass a single value (used for all stages), a vector of values (one for each stage), or a vector of vectors of values (one vector for each stage, containing a vector with one element for each markov stage). Another option is to pass a function that takes two inputs so that f(t, i) returns the valid bound for stage t and markov state i.\nsolver::MathProgBase.AbstractMathProgSolver: any MathProgBase compliant solver that returns duals from a linear program. If this isn\'t specified then you must use JuMP.setsolver(sp, solver) in the stage definition.Optional Keyword argumentssense: must be either :Max or :Min. Defaults to :Min.\ncut_oracle: the cut oracle is responsible for collecting and storing the cuts that define a value function. The cut oracle may decide that only a subset of the total discovered cuts are relevant, which improves solution speed by reducing the size of the subproblems that need solving. Currently must be one of\nDefaultCutOracle() (see DefaultCutOracle for explanation)\nLevelOneCutOracle()(see LevelOneCutOracle for explanation)\nrisk_measure: if a single risk measure is given (i.e.  risk_measure = Expectation()), then this measure will be applied to every  stage in the problem. Another option is to provide a vector of risk  measures. There must be one element for every stage. For example:risk_measure = [ EAVaR(lambda=0.5, beta=0.25), Expectation() ]will apply the i\'th element of risk_measure to every Markov state in the    i\'th stage. The last option is to provide a vector (one element for each    stage) of vectors of risk measures (one for each Markov state in the stage).    For example:risk_measure = [\n# Stage 1 Markov 1 # Stage 1 Markov 2 #\n   [ Expectation(), Expectation() ],\n   # ------- Stage 2 Markov 1 ------- ## ------- Stage 2 Markov 2 ------- #\n   [ EAVaR(lambda=0.5, beta=0.25), EAVaR(lambda=0.25, beta=0.3) ]\n   ]Like the objective bound, another option is to pass a function that takes\nas arguments the stage and markov state and returns a risk measure:function stagedependentrisk(stage, markov_state)\n    if state == 1\n        return Expectation()\n    else\n        if markov_state == 1\n            return EAVaR(lambda=0.5, beta=0.25)\n        else\n            return EAVaR(lambda=0.25, beta=0.3)\n        end\n    end\nend\n\nrisk_measure = stagedependentriskNote that even though the last stage does not have a future cost function    associated with it (as it has no children), we still have to specify a risk    measure. This is necessary to simplify the implementation of the algorithm.For more help see EAVaR or Expectation.markov_transition: define the transition probabilties of the stage graph. If a single array is given, it is assumed that there is an equal number of Markov states in each stage and the transition probabilities are stage invariant. Row indices represent the Markov state in the previous stage. Column indices represent the Markov state in the current stage. Therefore:markov_transition = [0.1 0.9; 0.8 0.2]is the transition matrix when there is 10% chance of transitioning from Markov    state 1 to Markov state 1, a 90% chance of transitioning from Markov state 1    to Markov state 2, an 80% chance of transitioning from Markov state 2 to Markov    state 1, and a 20% chance of transitioning from Markov state 2 to Markov state 2."
},

{
    "location": "oldindex.html#do-sp,-t,-i-...-end-1",
    "page": "Old Manual",
    "title": "do sp, t, i ... end",
    "category": "section",
    "text": "This constructor is just syntactic sugar to make the process of defining a model a little tidier. It\'s nothing special to SDDP.jl and many users will be familiar with it (for example, the open(file, \"w\") do io ... end syntax for file IO).An anonymous function with three arguments (sp, t and i, although these can be named arbitrarily) is constructed. The body of the function should build the subproblem as the JuMP model sp for stage t and markov state i. t is an integer that ranges from 1 to the number of stages. i is also an integer that ranges from 1 to the number of markov states in stage t.Users are also free to explicitly construct a function that takes three arguments, and pass that as the first argument to SDDPModel, along with the keyword arguments. For example:function buildsubproblem!(sp::JuMP.Model, t::Int, i::Int)\n    ... define states etc. ...\nend\nm = SDDPModel(buildsubproblem!; ... metadata as keyword arguments ...)note: Note\nIf you don\'t have any markov states in the model, you don\'t have to include the third argument in the constructor. SDDPModel() do sp, t ... end is also valid syntax."
},

{
    "location": "oldindex.html#JuMP-Subproblem-1",
    "page": "Old Manual",
    "title": "JuMP Subproblem",
    "category": "section",
    "text": "In the next sections, we explain in detail how for model state variables, constraints, the stage objective, and any uncertainties in the model. However, you should keep a few things in mind:the body of the do sp, t, i ... end block is just a normal Julia function body. As such, standard scoping rules apply.\nyou can use t and i whenever, and however, you like. For example:m = SDDPModel() do sp, t, i\n    if t == 1\n        # do something in the first stage only\n    else\n        # do something in the other stages\n    end\nendsp is just a normal JuMP model. You could (if so desired), set the solve hook, or add quadratic constraints (provided you have a quadratic solver)."
},

{
    "location": "oldindex.html#State-Variables-1",
    "page": "Old Manual",
    "title": "State Variables",
    "category": "section",
    "text": "We can define a new state variable in the stage problem sp using the @state macro:@state(sp, x >= 0.5, x0==1)The second argument (x) refers to the outgoing state variable (i.e. the value at the end of the stage). The third argument (x0) refers to the incoming state variable (i.e. the value at the beginning of the stage). For users familiar with SDDP, SDDP.jl handles all the calculation of the dual variables needed to evaluate the cuts automatically behind the scenes.The @state macro is just short-hand for writing:@variable(sp, x >= 0.5)\n@variable(sp, x0, start=1)\nSDDP.statevariable!(sp, x0, x)note: Note\nThe start=1 is only every used behind the scenes by the first stage problem. It\'s really just a nice syntatic trick we use to make specifying the model a bit more compact.This illustrates how we can use indexing just as we would in a JuMP @variable macro:X0 = [3.0, 2.0]\n@state(sp, x[i=1:2], x0==X0[i])In this case, both x and x0 are JuMP dicts that can be indexed with the keys 1 and 2. All the indices must be specified in the second argument, but they can be referred to in the third argument. The indexing of x0 will be identical to that of x.There is also a plural version of the @state macro:@states(sp, begin\n    x >= 0.0, x0==1\n    y >= 0.0, y0==1\nend)"
},

{
    "location": "oldindex.html#Standard-JuMP-machinery-1",
    "page": "Old Manual",
    "title": "Standard JuMP machinery",
    "category": "section",
    "text": "Remember that sp is just a normal JuMP model, and so (almost) anything you can do in JuMP, you can do in SDDP.jl. The one exception is the objective, which we detail in the next section.However, control variables are just normal JuMP variables and can be created using @variable or @variables. Dynamical constraints, and feasiblity sets can be specified using @constraint or @constraints."
},

{
    "location": "oldindex.html#The-stage-objective-1",
    "page": "Old Manual",
    "title": "The stage objective",
    "category": "section",
    "text": "If there is no stagewise independent uncertainty in the objective, then the stage objective (i.e. ignoring the future cost) can be set via the @stageobjective macro. This is similar to the JuMP @objective macro, but without the sense argument. For example:@stageobjective(sp, obj)If there is stagewise independent noise in the objective, we add an additional argument to @stageobjective that has the form kw=realizations.kw is a symbol that can appear anywhere in obj, and realizations is a vector of realizations of the uncertainty. For example:@stageobjective(sp, kw=realizations, obj)\nsetnoiseprobability!(sp, [0.2, 0.3, 0.5])setnoiseprobability! can be used to specify the finite discrete distribution of the realizations (it must sum to 1.0). If you don\'t explicitly call setnoiseprobability!, the distribution is assumed to be uniform.Other examples include:# noise is a coefficient\n@stageobjective(sp, c=[1.0, 2.0, 3.0], c * x)\n# noise is used to index a variable\n@stageobjective(sp, i=[1,2,3], 2 * x[i])"
},

{
    "location": "oldindex.html#Dynamics-with-linear-noise-1",
    "page": "Old Manual",
    "title": "Dynamics with linear noise",
    "category": "section",
    "text": "SDDP.jl also supports uncertainty in the right-hand-side of constraints. Instead of using the JuMP @constraint macro, we need to use the @rhsnoise macro:@rhsnoise(sp, w=[1,2,3], x <= w)\nsetnoiseprobability!(sp, [0.2, 0.3, 0.5])Compared to @constraint, there are a couple of notable differences:indexing is not supported;\nthe second argument is a kw=realizations key-value pair like the @stageobjective;\nthe kw can on either side of the constraint as written, but when normalised  to an Ax <= b form, it must only appear in the b vector.Multiple @rhsnoise constraints can be added, however they must have an identical number of elements in the realizations vector.For example, the following are invalid in SDDP:# noise appears as a variable coefficient\n@rhsnoise(sp, w=[1,2,3], w * x <= 1)\n\n# JuMP style indexing\n@rhsnoise(sp, w=[1,2,3], [i=1:10; mod(i, 2) == 0], x[i] <= w)\n\n# noises have different number of realizations\n@rhsnoise(sp, w=[1,2,3], x <= w)\n@rhsnoise(sp, w=[2,3],   x >= w-1)note: Note\nNoises in the constraints are sampled with the noise in the objective. Therefore, there should be the same number of elements in the realizations for the stage objective, as there are in the constraint noise.There is also a plural form of the @rhsnoise macro:@rhsnoises(sp, w=[1,2,3], begin\n    x <= w\n    x >= w-1\nend)\nsetnoiseprobability!(sp, [0.2, 0.3, 0.5])"
},

{
    "location": "oldindex.html#Asset-Management-Example-1",
    "page": "Old Manual",
    "title": "Asset Management Example",
    "category": "section",
    "text": "We now have all the information necessary to define the Asset Management example in SDDP.jl:using SDDP, JuMP, Clp\n\nm = SDDPModel(\n               # we are minimizing\n                sense = :Min,\n               # there are 4 stages\n               stages = 4,\n               # a large negative value\n      objective_bound = -1000.0,\n               # a MathOptBase compatible solver\n               solver = ClpSolver(),\n               # transition probabilities of the lattice\n    markov_transition = Array{Float64, 2}[\n                        [1.0]\',\n                        [0.5 0.5],\n                        [0.5 0.5; 0.5 0.5],\n                        [0.5 0.5; 0.5 0.5]\n                    ],\n               # risk measures for each stage\n         risk_measure = [\n                        Expectation(),\n                        Expectation(),\n                        EAVaR(lambda = 0.5, beta=0.5),\n                        Expectation()\n                    ]\n                            ) do sp, t, i\n    # Data used in the problem\n    ωs = [1.25, 1.06]\n    ωb = [1.14, 1.12]\n    Φ  = [-1, 5]\n    Ψ  = [0.02, 0.0]\n\n    # state variables\n    @states(sp, begin\n        xs >= 0, xsbar==0\n        xb >= 0, xbbar==0\n    end)\n\n    if t == 1 # we can switch based on the stage\n        # a constraint without noise\n        @constraint(sp, xs + xb == 55 + xsbar + xbbar)\n        # an objective without noise\n        @stageobjective(sp, 0)\n    elseif t == 2 || t == 3\n        # a constraint with noisein the RHS\n        @rhsnoise(sp, φ=Φ, ωs[i] * xsbar + ωb[i] * xbbar + φ == xs + xb)\n        # an objective with noise\n        @stageobjective(sp, ψ = Ψ, -ψ * xs)\n        # noise will be sampled as (Φ[1], Ψ[1]) w.p. 0.6, (Φ[2], Ψ[2]) w.p. 0.4\n        setnoiseprobability!(sp, [0.6, 0.4])\n    else # when t == 4\n        # some control variables\n        @variable(sp, u >= 0)\n        @variable(sp, v >= 0)\n        # dynamics constraint\n        @constraint(sp, ωs[i] * xsbar + ωb[i] * xbbar + u - v == 80)\n        # an objective without noise\n        @stageobjective(sp, 4u - v)\n    end\nend"
},

{
    "location": "oldindex.html#Solving-the-problem-efficiently-1",
    "page": "Old Manual",
    "title": "Solving the problem efficiently",
    "category": "section",
    "text": "During the solution process, SDDP.jl outputs some logging information (an example of this is given below). We briefly describe the columns:The first column (Objective (Simulation)) is either a single value or a confidence interval from a Monte Carlo simulation (see MonteCarloSimulation). When the entry is a single value, its is the objective from a single (and the most recent) forward pass in SDDP. The single value is not an average. The second column (Objective (Bound)) is the deterministic bound of the problem (lower if minimizing, upper if maximizing). This is calculated every iteration. If a Monte Carlo simulation has been conducted this iteration, then the Objective (% Gap) will also be display. The objective gap is the relative percentage gap between the closest edge of the confidence interval and the deterministic bound.The next two columns relate to the number of iterations (#) and time spend conducting them (Time). This information is printed every iteration. It does not include the time spent simulating the policy as part of the Monte Carlo simulation (i.e. to estimate the upper bound), or the time spent initializing the model.The sixth and seventh columns relate to the Monte Carlo simulations. Specifically the number (#) of replications conducted, and time spent conducting them (Time). You can use these data to determine how often to perform the Monte Carlo simulations. For example, if the time is high relative to the iteration Cut Passes: Time, then you should perform the simulations less frequently.Finally, Total (Time) is the total time (in seconds) of the solution process (including initialization).Logging can be turned off by setting print level to 0. It can also be written to the file specified by the log file keyword.-------------------------------------------------------------------------------\n                      SDDP Solver. © Oscar Dowson, 2017.\n-------------------------------------------------------------------------------\n    Solver:\n        Serial solver\n    Model:\n        Stages:         4\n        States:         2\n        Subproblems:    7\n        Value Function: Default\n-------------------------------------------------------------------------------\n              Objective              |  Cut  Passes    Simulations   Total    \n    Simulation        Bound   % Gap  |   #     Time     #    Time    Time     \n-------------------------------------------------------------------------------\n      -41.484         -9.722         |     1    0.0      0    0.0    0.0\n       -2.172         -7.848         |     2    0.0      0    0.0    0.0\n        4.284         -7.550         |     3    0.0      0    0.0    0.0\n      -10.271         -6.398         |     4    0.0      0    0.0    0.0\n  -7.782    -4.760    -6.346  -22.6  |     5    0.0    500    0.4    0.4\n\n                        ... some lines omitted ...\n\n      -30.756         -5.570         |    29    0.1    1.9K   1.6    1.8\n  -7.716    -4.601    -5.570  -38.5  |    30    0.1    2.4K   2.0    2.2\n  -------------------------------------------------------------------------------\n    Statistics:\n        Iterations:         30\n        Termination Status: iteration_limit\n---------------------------------------------------------------------------------"
},

{
    "location": "oldindex.html#Understanding-the-solution-1",
    "page": "Old Manual",
    "title": "Understanding the solution",
    "category": "section",
    "text": "... still to do ..."
},

{
    "location": "oldindex.html#Simulating-the-policy-1",
    "page": "Old Manual",
    "title": "Simulating the policy",
    "category": "section",
    "text": "You can perform a Monte-Carlo simulation of the policy using the simulate function:simulationresults = simulate(m, 100, [:xs, :xb])simulationresults is a vector of dictionaries (one for each simulation). It has, as keys, a vector (with one element for each stage) of the optimal solution of xs and xb. For example, to query the value of xs in the third stage of the tenth simulation, we can call:simulationresults[10][:xs][3]Alternatively, you can peform one simulation with a given realization for the Markov and stagewise independent noises:simulationresults = simulate(m, [:xs], markov=[1,2,1,1], noise=[1,2,2,3])"
},

{
    "location": "oldindex.html#Visualizing-the-policy-simulation-1",
    "page": "Old Manual",
    "title": "Visualizing the policy simulation",
    "category": "section",
    "text": "First, we create a new plotting object with SDDP.newplot(). Next, we can add any number of subplots to the visualization via the SDDP.addplot! function. Finally, we can launch a web browser to display the plot with SDDP.show.See the SDDP.addplot! documentation for more detail."
},

{
    "location": "oldindex.html#Visualizing-the-Value-Function-1",
    "page": "Old Manual",
    "title": "Visualizing the Value Function",
    "category": "section",
    "text": "Another way to understand the solution is to project the value function into 3 dimensions. This can be done using the method SDDP.plotvaluefunction.SDDP.plotvaluefunction(m, 1, 1, 0:1.0:100, 0:1.0:100;\n    label1=\"Stocks\", label2=\"Bonds\")This will open up a web browser and display a Plotly figure that looks similar to (Image: 3-Dimensional visualisation of Value Function)"
},

{
    "location": "oldindex.html#Saving-models-1",
    "page": "Old Manual",
    "title": "Saving models",
    "category": "section",
    "text": "Saving a model is as simple as calling:SDDP.savemodel!(\"<filename>\", m)Later, you can run:m = SDDP.loadmodel(\"<filename>\")note: Note\nSDDP.savemodel! relies on the base Julia serialize function. This is not backwards compatible with previous versions of Julia, or guaranteed to be forward compatible with future versions. You should only use this to save models for short periods of time. Don\'t save a model you want to come back to in a year.Another (more persistent) method is to use the cut_output_file keyword option in SDDP.solve. This will create a csv file containing a list of all the cuts. These can be loaded at a later date usingSDDP.loadcuts!(m, \"<filename>\")"
},

{
    "location": "oldindex.html#Extras-for-experts-1",
    "page": "Old Manual",
    "title": "Extras for experts",
    "category": "section",
    "text": ""
},

{
    "location": "oldindex.html#New-risk-measures-1",
    "page": "Old Manual",
    "title": "New risk measures",
    "category": "section",
    "text": "SDDP.jl makes it easy to create new risk measures. First, create a new subtype of the abstract type SDDP.AbstractRiskMeasure:struct MyNewRiskMeasure <: SDDP.AbstractRiskMeasure\nendThen, overload the method SDDP.modifyprobability! for your new type. SDDP.modifyprobability! has the following signature:SDDP.modifyprobability!(\n        measure::AbstractRiskMeasure,\n        riskadjusted_distribution,\n        original_distribution::Vector{Float64},\n        observations::Vector{Float64},\n        m::SDDPModel,\n        sp::JuMP.Model\n)where original_distribution contains the risk netural probability of each outcome in observations occurring (so that the probability of observations[i] is original_distribution[i]). The method should modify (in-place) the elements of riskadjusted_distribution to represent the risk-adjusted probabilities of the distribution.To illustrate this, we shall define the worst-case riskmeasure (which places all the probability on the worst outcome):struct WorstCase <: SDDP.AbstractRiskMeasure end\nfunction SDDP.modifyprobability!(measure::WorstCase,\n        riskadjusted_distribution,\n        original_distribution::Vector{Float64},\n        observations::Vector{Float64},\n        m::SDDPModel,\n        sp::JuMP.Model\n    )\n    if JuMP.getobjectivesense(sp) == :Min\n        # if minimizing, worst is the maximum outcome\n        idx = indmax(observations)\n    else\n        # if maximizing, worst is the minimum outcome\n        idx = indmin(observations)\n    end\n    # zero all probabilities\n    riskadjusted_distribution .= 0.0\n    # set worst to 1.0\n    riskadjusted_distribution[idx] = 1.0\n    # return\n    return nothing\nendThe risk measure WorstCase() can now be used in any SDDP model.note: Note\nThis method gets called a lot, so the usual Julia performance tips apply."
},

{
    "location": "oldindex.html#New-cut-oracles-1",
    "page": "Old Manual",
    "title": "New cut oracles",
    "category": "section",
    "text": "SDDP.jl makes it easy to create new cut oracles. In the following example, we give the code to implmeent a cut-selection heuristic that only stores the N most recently discovered cuts. First, we define a new Julia type that is a sub-type of the abstract type SDDP.AbstractCutOracle defined by SDDP.jl:struct LastCutOracle{N} <: SDDP.AbstractCutOracle\n    cuts::Vector{SDDP.Cut}\nend\nLastCutOracle(N::Int) = LastCutOracle{N}(SDDP.Cut[])LastCutOracle has the type parameter N to store the maximum number of most-recent cuts to return. The type has the field cuts to store a vector of discovered cuts. More elaborate cut-selection heuristics may need additional fields to store other information. Next, we overload the SDDP.storecut! method. This method should store the cut c in the oracle o so that it can be queried later. In our example, we append the cut to the list of discovered cuts inside the oracle:function SDDP.storecut!(o::LastCutOracle{N},\n        m::SDDPModel, sp::JuMP.Model, c::SDDP.Cut) where N\n    push!(o.cuts, c)\nendLastly, we overload the SDDP.validcuts method. In our example, the strategy is to return the N most recent cuts. Therefore:function SDDP.validcuts(o::LastCutOracle{N}) where N\n    return o.cuts[max(1,end-N+1):end]\nendThe cut oracle LastCutOracle(N) can now be used in any SDDP model."
},

{
    "location": "apireference.html#",
    "page": "Reference",
    "title": "Reference",
    "category": "page",
    "text": "CurrentModule = SDDP"
},

{
    "location": "apireference.html#API-Reference-1",
    "page": "Reference",
    "title": "API Reference",
    "category": "section",
    "text": ""
},

{
    "location": "apireference.html#SDDP.SDDPModel",
    "page": "Reference",
    "title": "SDDP.SDDPModel",
    "category": "type",
    "text": "SDDPModel(;kwargs...) do ...\n\nend\n\nDescription\n\nThis function constructs an SDDPModel. SDDPModel takes the following keyword arguments. Some are required, and some are optional.\n\nRequired Keyword arguments\n\nstages::Int\n\nThe number of stages in the problem. A stage is defined as each step in time at  which a decion can be made. Defaults to 1.\n\nobjective_bound\n\nA valid bound on the initial value/cost to go. i.e. for maximisation this may  be some large positive number, for minimisation this may be some large negative  number. Users can pass either a single value (which bounds the cost-to-go in all  stages), or a vector of values (one for each stage), or a vector (one element  for each stage) of vectors of values (one value for each markov state in the stage).\n\nsolver::MathProgBase.AbstractMathProgSolver\n\nMathProgBase compliant solver that returns duals from a linear program. If this  isn\'t specified then you must use JuMP.setsolver(sp, solver) in the stage  definition.\n\nOptional Keyword arguments\n\nsense\n\nMust be either :Max or :Min. Defaults to :Min.\n\ncut_oracle::SDDP.AbstractCutOracle\n\nThe cut oracle is responsible for collecting and storing the cuts that define  a value function. The cut oracle may decide that only a subset of the total  discovered cuts are relevant, which improves solution speed by reducing the  size of the subproblems that need solving. Currently must be one of     * DefaultCutOracle() (see DefaultCutOracle for explanation)     * LevelOneCutOracle()(see LevelOneCutOracle for explanation)\n\nrisk_measure\n\nIf a single risk measure is given (i.e. risk_measure = Expectation()), then  this measure will be applied to every stage in the problem. Another option is  to provide a vector of risk measures. There must be one element for every  stage. For example:\n\nrisk_measure = [ NestedAVaR(lambda=0.5, beta=0.25), Expectation() ]\n\nwill apply the i\'th element of risk_measure to every Markov state in the i\'th stage. The last option is to provide a vector (one element for each stage) of vectors of risk measures (one for each Markov state in the stage). For example:\n\nrisk_measure = [\n# Stage 1 Markov 1 # Stage 1 Markov 2 #\n    [ Expectation(), Expectation() ],\n    # ------- Stage 2 Markov 1 ------- ## ------- Stage 2 Markov 2 ------- #\n    [ NestedAVaR(lambda=0.5, beta=0.25), NestedAVaR(lambda=0.25, beta=0.3) ]\n    ]\n\nNote that even though the last stage does not have a future cost function associated with it (as it has no children), we still have to specify a risk measure. This is necessary to simplify the implementation of the algorithm.\n\nFor more help see NestedAVaR or Expectation.\n\nmarkov_transition\n\nDefine the transition probabilties of the stage graph. If a single array is given, it is assumed that there is an equal number of Markov states in each stage and the transition probabilities are stage invariant. Row indices represent the Markov state in the previous stage. Column indices represent the Markov state in the current stage. Therefore:\n\nmarkov_transition = [0.1 0.9; 0.8 0.2]\n\nis the transition matrix when there is 10% chance of transitioning from Markov state 1 to Markov state 1, a 90% chance of transitioning from Markov state 1 to Markov state 2, an 80% chance of transitioning from Markov state 2 to Markov state 1, and a 20% chance of transitioning from Markov state 2 to Markov state 2.\n\nReturns\n\nm: the SDDPModel\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.@state",
    "page": "Reference",
    "title": "SDDP.@state",
    "category": "macro",
    "text": "@state(sp, stateleaving, stateentering)\n\nDescription\n\nDefine a new state variable in the subproblem sp.\n\nArguments\n\nsp               the subproblem\nstateleaving     any valid JuMP @variable syntax to define the value of the state variable at the end of the stage\nstateentering    any valid JuMP @variable syntax to define the value of the state variable at the beginning of the stage\n\nExamples\n\n@state(sp, 0 <= x[i=1:3] <= 1, x0==rand(3)[i] )\n@state(sp,      y        <= 1, y0==0.5        )\n@state(sp,      z            , z0==0.5        )\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.@states",
    "page": "Reference",
    "title": "SDDP.@states",
    "category": "macro",
    "text": "@states(sp, begin\n    stateleaving1, stateentering1\n    stateleaving2, stateentering2\nend)\n\nDescription\n\nDefine a new state variables in the subproblem sp.\n\nArguments\n\nsp               the subproblem\nstateleaving     any valid JuMP @variable syntax to define the value of the state variable at the end of the stage\nstateentering    any valid JuMP @variable syntax to define the value of the state variable at the beginning of the stage\n\nUsage\n\n@states(sp, begin\n    0 <= x[i=1:3] <= 1, x0==rand(3)[i]\n         y        <= 1, y0==0.5\n         z            , z0==0.5\n end)\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.@rhsnoise",
    "page": "Reference",
    "title": "SDDP.@rhsnoise",
    "category": "macro",
    "text": "@rhsnoise(sp, rhs, constraint)\n\nDescription\n\nAdd a constraint with a noise in the RHS vector to the subproblem sp.\n\nArguments\n\nsp         the subproblem\nrhs        keyword argument key=value where value is a one-dimensional array containing the noise realisations\nconstraint any valid JuMP @constraint syntax that includes the keyword defined by rhs\n\nExamples\n\n@rhsnoise(sp, i=1:2, x + y <= i )\n@rhsnoise(sp, i=1:2, x + y <= 3 * rand(2)[i] )\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.@rhsnoises",
    "page": "Reference",
    "title": "SDDP.@rhsnoises",
    "category": "macro",
    "text": "@rhsnoises(sp, rhs, begin\n    constraint\nend)\n\nDescription\n\nThe plural form of @rhsnoise similar to the JuMP macro @constraints.\n\nArguments\n\nSee @rhsnoise.\n\nExamples\n\n@rhsnoises(sp, i=1:2, begin\n    x + y <= i\n    x + y <= 3 * rand(2)[i]\nend)\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.setnoiseprobability!",
    "page": "Reference",
    "title": "SDDP.setnoiseprobability!",
    "category": "function",
    "text": "setnoiseprobability!(sp::JuMP.Model, distribution::Vector{Float64})\n\nDescription\n\nSet the probability distribution of the stagewise independent noise in the sp subproblem.\n\nArguments\n\nsp            the subproblem\ndistribution vector containing the probability of each outcome occuring.   Should sum to 1. Defaults to the uniform distribution.\n\nExamples\n\nIf there are two realizations:\n\nsetnoiseprobability!(sp, [0.3, 0.7])\nsetnoiseprobability!(sp, [0.5, 0.6]) will error!\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.@stageobjective",
    "page": "Reference",
    "title": "SDDP.@stageobjective",
    "category": "macro",
    "text": "@stageobjective(sp, kw=noises, objective)\n\nDescription\n\nDefine an objective that depends on the realization of the stagewise noise. objective can be any valid third argument to the JuMP @objective macro (i.e. @objective(sp, Min, objective)) that utilises the variable kw that takes the realizations defined in noises.\n\nExamples\n\n@stageobjective(sp, w=1:2, w * x)\n@stageobjective(sp, i=1:2, w[i]^2 * x)\n@stageobjective(sp, i=1:2, x[i])\n\n\n\n@stageobjective(sp, objective)\n\nDescription\n\nDefine a deterministic objective.\n\nExamples\n\n@stageobjective(sp, x + y)\n\n\n\n"
},

{
    "location": "apireference.html#Communicating-the-problem-to-the-solver-1",
    "page": "Reference",
    "title": "Communicating the problem to the solver",
    "category": "section",
    "text": "SDDPModel\n@state\n@states\n@rhsnoise\n@rhsnoises\nsetnoiseprobability!\n@stageobjective"
},

{
    "location": "apireference.html#SDDP.AbstractRiskMeasure",
    "page": "Reference",
    "title": "SDDP.AbstractRiskMeasure",
    "category": "type",
    "text": "AbstractRiskMeasure\n\nDescription\n\nAbstract type for all risk measures.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.modifyprobability!",
    "page": "Reference",
    "title": "SDDP.modifyprobability!",
    "category": "function",
    "text": "modifyprobability!(measure::AbstractRiskMeasure,\n        riskadjusted_distribution,\n        original_distribution::Vector{Float64},\n        observations::Vector{Float64},\n        m::SDDPModel,\n        sp::JuMP.Model\n)\n\nDescription\n\nCalculate the risk-adjusted probability of each scenario using the \'change-of-probabilities\' approach of Philpott, de Matos, and Finardi,(2013). On solving multistage stochastic programs with coherent risk measures. Operations Research 61(4), 957-970.\n\nArguments\n\nmeasure::AbstractRiskMeasure\n\nThe risk measure\n\nriskadjusted_distribution\n\nA new probability distribution\n\noriginal_distribution::Vector{Float64}\n\nThe original probability distribution.\n\nobservations::Vector{Float64}\n\nThe vector of objective values from the next stage  problems (one for each scenario).\n\nm::SDDPModel\n\nThe full SDDP model\n\nsp::JuMP.Model\n\nThe stage problem that the cut will be added to.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.AVaR",
    "page": "Reference",
    "title": "SDDP.AVaR",
    "category": "type",
    "text": "AVaR(beta::Float64)\n\nThe Average Value @ Risk measure. When beta=0, the measure is the is worst-case, when beta=1 the measure is equivalent to expectation.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.ConvexCombination",
    "page": "Reference",
    "title": "SDDP.ConvexCombination",
    "category": "type",
    "text": "ConvexCombination( (weight::Float64, measure::AbstractRiskMeasure) ... )\n\nCreate a weighted combination of risk measures.\n\nExamples\n\nConvexCombination(\n    (0.5, Expectation()),\n    (0.5, AVaR(0.25))\n)\n\nConvex combinations can also be constructed by adding weighted risk measures together as follows:\n\n0.5 * Expectation() + 0.5 * AVaR(0.5)\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.EAVaR",
    "page": "Reference",
    "title": "SDDP.EAVaR",
    "category": "function",
    "text": "EAVaR(;lambda=1.0, beta=1.0)\n\nDescription\n\nA risk measure that is a convex combination of Expectation and Average Value @ Risk (also called Conditional Value @ Risk).\n\nλ * E[x] + (1 - λ) * AV@R(1-β)[x]\n\nKeyword Arguments\n\nlambda\n\nConvex weight on the expectation ((1-lambda) weight is put on the AV@R component. Inreasing values of lambda are less risk averse (more weight on expecattion)\n\nbeta\n\nThe quantile at which to calculate the Average Value @ Risk. Increasing values  of beta are less risk averse. If beta=0, then the AV@R component is the  worst case risk measure.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.Expectation",
    "page": "Reference",
    "title": "SDDP.Expectation",
    "category": "type",
    "text": "Expectation()\n\nThe expectation risk measure.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.DRO",
    "page": "Reference",
    "title": "SDDP.DRO",
    "category": "type",
    "text": "DRO(radius::Float64)\n\nThe distributionally robust SDDP risk measure. Constructs a DRO risk measure object that allows probabilities to deviate by radius away from the uniform distribution.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.WorstCase",
    "page": "Reference",
    "title": "SDDP.WorstCase",
    "category": "type",
    "text": "WorstCase()\n\nThe worst-case risk measure.\n\n\n\n"
},

{
    "location": "apireference.html#Risk-Measures-1",
    "page": "Reference",
    "title": "Risk Measures",
    "category": "section",
    "text": "AbstractRiskMeasure\nmodifyprobability!\nAVaR\nConvexCombination\nEAVaR\nExpectation\nDRO\nWorstCase"
},

{
    "location": "apireference.html#SDDP.AbstractCutOracle",
    "page": "Reference",
    "title": "SDDP.AbstractCutOracle",
    "category": "type",
    "text": "AbstractCutOracle\n\nDescription\n\nAbstract type for all cut oracles.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.storecut!",
    "page": "Reference",
    "title": "SDDP.storecut!",
    "category": "function",
    "text": "storecut!(oracle::AbstactCutOracle, m::SDDPModel, sp::JuMP.Model, cut::Cut)\n\nDescription\n\nStore the cut cut in the Cut Oracle oracle. oracle will belong to the subproblem sp in the SDDPModel m.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.validcuts",
    "page": "Reference",
    "title": "SDDP.validcuts",
    "category": "function",
    "text": "validcuts(oracle::AbstactCutOracle)\n\nDescription\n\nReturn an iterable list of all the valid cuts contained within oracle.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.DefaultCutOracle",
    "page": "Reference",
    "title": "SDDP.DefaultCutOracle",
    "category": "type",
    "text": "DefaultCutOracle()\n\nDescription\n\nInitialize the default cut oracle.\n\nThis oracle keeps every cut discovered and does not perform cut selection.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.LevelOneCutOracle",
    "page": "Reference",
    "title": "SDDP.LevelOneCutOracle",
    "category": "type",
    "text": "LevelOneCutOracle()\n\nDescription\n\nInitialize the cut oracle for Level One cut selection. See:\n\nV. de Matos, A. Philpott, E. Finardi, Improving the performance of Stochastic Dual Dynamic Programming, Journal of Computational and Applied Mathematics 290 (2015) 196–208.\n\n\n\n"
},

{
    "location": "apireference.html#Cut-Oracles-1",
    "page": "Reference",
    "title": "Cut Oracles",
    "category": "section",
    "text": "AbstractCutOracle\nstorecut!\nvalidcuts\nDefaultCutOracle\nLevelOneCutOracle"
},

{
    "location": "apireference.html#SDDP.StaticPriceInterpolation",
    "page": "Reference",
    "title": "SDDP.StaticPriceInterpolation",
    "category": "type",
    "text": "StaticPriceInterpolation(; kwargs...)\n\nConstuctor for the static price interpolation value function described in\n\nGjelsvik, A., Belsnes, M., and Haugstad, A., (1999). An Algorithm for Stochastic Medium Term Hydro Thermal Scheduling under Spot Price Uncertainty. In PSCC: 13th Power Systems Computation Conference : Proceedings P. 1328. Trondheim: Executive Board of the 13th Power Systems Computation Conference, 1999.\n\nKeyword arguments\n\ndynamics: a function that takes two arguments      1. price: a Float64 that gives the price in the previous stage.      2. noise: a single NoiseRealization of the price noise observed at          the start of the stage.      The function should return a Float64 of the price for the current stage.\ninitial_price: a Float64 for the an initial value for each dimension of the price states.\nrib_locations: an AbstractVector{Float64} giving the points at which to  discretize the price dimension.\nnoise: a finite-discrete distribution generated by DiscreteDistribution\ncut_oracle: any AbstractCutOracle\n\nExample\n\nStaticPriceInterpolation(\n    dynamics = (price, noise) -> begin\n            return price + noise - t\n        end,\n    initial_price = 50.0\n    rib_locations = 0.0:10.0:100.0,\n    noise = DiscreteDistribution([-10.0, 40.0], [0.8, 0.2]),\n)\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.DynamicPriceInterpolation",
    "page": "Reference",
    "title": "SDDP.DynamicPriceInterpolation",
    "category": "type",
    "text": "DynamicPriceInterpolation(; kwargs...)\n\nConstuctor for the dynamic price interpolation value function described in Downward, A., Dowson, O., and Baucke, R. (2018). On the convergence of a cutting plane method for multistage stochastic programming problems with stagewise dependent price uncertainty. Optimization Online.\n\nKeyword arguments\n\ndynamics: a function that takes two arguments      1. price: a Float64 (if uni-variate) or NTuple{N,Float64} if multi-variate          that gives the price in the previous stage.      2. noise: a single NoiseRealization of the price noise observed at          the start of the stage.      The function should return a Float64 (if uni-variate) or NTuple{N,Float64}      if multi-variate that gives the price for the current stage.\ninitial_price: a Float64 (if uni-variate) or NTuple{N,Float64} if multi-variate  that gives the an initial value for each dimension of the price states.\nmin_price: a Float64 (if uni-variate) or NTuple{N,Float64} if multi-variate  that gives the minimum value of each dimension of the price states.\nmax_price: a Float64 (if uni-variate) or NTuple{N,Float64} if multi-variate  that gives the maximum value of each dimension of the price states.\nnoise: a finite-discrete distribution generated by DiscreteDistribution\nlipschitz_constant: the maximum absolute subgradient of any price dimension  in the domain bounded by min_price and max_price.\ncut_oracle: a DynamicCutOracle.\n\nExamples\n\nA uni-variate price process:\n\nDynamicPriceInterpolation(\n    dynamics = (price, noise) -> begin\n            return price + noise - t\n        end,\n    initial_price = 50.0\n    min_price = 0.0,\n    max_price = 100.0,\n    noise = DiscreteDistribution([-10.0, 40.0], [0.8, 0.2]),\n    lipschitz_constant = 1e4\n)\n\nA multi-variate price process:\n\nDynamicPriceInterpolation(\n    dynamics = (price, noise) -> begin\n            return (noise * price[1], noise * price[2] - noise)\n        end,\n    initial_price = (50.0, 50.0),\n    min_price = (0.0,0.0),\n    max_price = (100.0,100.0),\n    noise = DiscreteDistribution([0.5, 1.2], [0.8, 0.2]),\n    lipschitz_constant = 1e4\n)\n\n\n\n"
},

{
    "location": "apireference.html#Price-Interpolation-1",
    "page": "Reference",
    "title": "Price Interpolation",
    "category": "section",
    "text": "StaticPriceInterpolation\nDynamicPriceInterpolation"
},

{
    "location": "apireference.html#JuMP.solve",
    "page": "Reference",
    "title": "JuMP.solve",
    "category": "function",
    "text": "solve(m::SDDPModel; kwargs...)\n\nDescription\n\nSolve the SDDPModel m using SDDP. Accepts a number of keyword arguments to control the solution process.\n\nPositional arguments\n\nm: the SDDPModel to solve\n\nKeyword arguments\n\nmax_iterations::Int:  The maximum number of cuts to add to a single stage problem before terminating.  Defaults to 10.\ntime_limit::Real:  The maximum number of seconds (in real time) to compute for before termination.  Defaults to Inf.\nsimulation::MonteCarloSimulation: see MonteCarloSimulation\nbound_convergence::BoundConvergence: see BoundConvergence\ncut_selection_frequency::Int:  Frequency (by iteration) with which to rebuild subproblems using a subset of  cuts. Frequent cut selection (i.e. cut_selection_frequency is small) reduces  the size of the subproblems that are solved, but incurrs the overhead of rebuilding  the subproblems. However, infrequent cut selection (i.e.  cut_selection_frequency is large) allows the subproblems to grow large (many  constraints) leading to an increase in the solve time of individual subproblems.  Defaults to 0 (never run).\nprint_level::Int:   0 - off: nothing logged.   1 - on: solve iterations logged.   2 - verbose: detailed timing information is also logged.   Defaults to 1\nlog_file::String:  Relative filename to write the log to disk. Defaults to \"\" (no log written)\nsolve_type:  One of\nAsynchronous() - solve using a parallelised algorithm\nSerial() - solve using a serial algorithm\nDefault chooses automatically based on the number of available processors.\nreduce_memory_footprint::Bool:  Implements the idea proposed in https://github.com/JuliaOpt/JuMP.jl/issues/969#issuecomment-282191105  to reduce the memory consumption when running SDDP. This is an issue if you  wish to save the model m to disk since it discards important information.  Defaults to false.\ncut_output_file::String:  Relative filename to write discovered cuts to disk. Defaults to \"\" (no cuts written)\n\nReturns\n\nstatus::Symbol:  Reason for termination. One of\n:solving\n:interrupted\n:converged\n:max_iterations\n:bound_convergence\n:time_limit\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.MonteCarloSimulation",
    "page": "Reference",
    "title": "SDDP.MonteCarloSimulation",
    "category": "type",
    "text": "MonteCarloSimulation(;kwargs...)\n\nDescription\n\nCollection of settings to control the simulation phase of the SDDP solution process.\n\nArguments\n\nfrequency::Int\n\nThe frequency (by iteration) with which to run the policy simulation phase of the algorithm in order to construct a statistical bound for the policy. Defaults to 0 (never run).\n\nmin::Float64\n\nMinimum number of simulations to conduct before constructing a confidence interval for the bound. Defaults to 20.\n\nstep::Float64\n\nNumber of additional simulations to conduct before constructing a new confidence interval for the bound. Defaults to 1.\n\nmax::Float64\n\nMaximum number of simulations to conduct in the policy simulation phase. Defaults to min.\n\nconfidence::Float64\n\nConfidence level of the confidence interval. Defaults to 0.95 (95% CI).\n\ntermination::Bool\n\nWhether to terminate the solution algorithm with the status :converged if the deterministic bound is with in the statistical bound after max simulations. Defaults to false.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.BoundConvergence",
    "page": "Reference",
    "title": "SDDP.BoundConvergence",
    "category": "type",
    "text": "BoundConvergence(;kwargs...)\n\nDescription\n\nCollection of settings to control the bound stalling convergence test.\n\nArguments\n\niterations::Int\n\nTerminate if the maximum deviation in the deterministic bound from the mean over the last iterations number of iterations is less than rtol (in relative terms) or atol (in absolute terms).\n\nrtol::Float64\n\nMaximum allowed relative deviation from the mean. Defaults to 0.0\n\natol::Float64\n\nMaximum allowed absolute deviation from the mean. Defaults to 0.0\n\n\n\n"
},

{
    "location": "apireference.html#Solving-the-problem-efficiently-1",
    "page": "Reference",
    "title": "Solving the problem efficiently",
    "category": "section",
    "text": "solve\nMonteCarloSimulation\nBoundConvergence"
},

{
    "location": "apireference.html#SDDP.simulate",
    "page": "Reference",
    "title": "SDDP.simulate",
    "category": "function",
    "text": "simulate(m::SDDPPModel,variables::Vector{Symbol};\n    noises::Vector{Int}, markovstates::Vector{Int})\n\nDescription\n\nPerform a historical simulation of the current policy in model  m.\n\nnoises is a vector with one element for each stage giving the index of the (in-sample) stagewise independent noise to sample in each stage. markovstates is a vector with one element for each stage giving the index of the (in-sample) markov state to sample in each stage.\n\nExamples\n\nsimulate(m, [:x, :u], noises=[1,2,2], markovstates=[1,1,2])\n\n\n\nresults = simulate(m::SDDPPModel, N::Int, variables::Vector{Symbol})\n\nDescription\n\nPerform N Monte-Carlo simulations of the current policy in model m saving the values of the variables named in variables at every stage.\n\nresults is a vector containing a dictionary for each simulation. In addition to the variables specified in the function call, other special keys are:\n\n:stageobjective - costs incurred during the stage (not future)\n:obj            - objective of the stage including future cost\n:markov         - index of markov state visited\n:noise          - index of noise visited\n:objective      - Total objective of simulation\n\nAll values can be accessed as follows\n\nresults[simulation index][key][stage]\n\nwith the exception of :objective which is just\n\nresults[simulation index][:objective]\n\nExamples\n\nresults = simulate(m, 10, [:x, :u])\nresults[1][:objective] # objective of simulation 1\nmean(r[:objective] for r in results) # mean objective of the simulations\nresults[2][:x][3] # value of :x in stage 3 in second simulation\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.getbound",
    "page": "Reference",
    "title": "SDDP.getbound",
    "category": "function",
    "text": "getbound(m)\n\nDescription\n\nGet the lower (if minimizing), or upper (if maximizing) bound of the solved SDDP model m.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.newplot",
    "page": "Reference",
    "title": "SDDP.newplot",
    "category": "function",
    "text": "SDDP.newplot()\n\nDescription\n\nInitialize a new SimulationPlot.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.addplot!",
    "page": "Reference",
    "title": "SDDP.addplot!",
    "category": "function",
    "text": "SDDP.addplot!(p::SimulationPlot, ivals::AbstractVector{Int}, tvals::AbstractVector{Int}, f::Function; kwargs...)\n\nDescription\n\nAdd a new figure to the SimulationPlot p, where the y-value is given by f(i, t) for all i in ivals (one for each series) and t in tvals (one for each stage).\n\nKeywords\n\nxlabel: set the xaxis label;\nylabel: set the yaxis label;\ntitle: set the title of the plot;\nymin: set the minimum y value;\nymax: set the maximum y value;\ncumulative: plot the additive accumulation of the value across the stages;\ninterpolate: interpolation method for lines between stages. Defaults to \"linear\"  see the d3 docs\n\nfor all options.\n\nExamples\n\nresults = simulate(m, 10)\np = SDDP.newplot()\nSDDP.addplot!(p, 1:10, 1:3, (i,t)->results[i][:stageobjective][t])\n\n\n\n"
},

{
    "location": "apireference.html#Base.show-Tuple{SDDP.SimulationPlot}",
    "page": "Reference",
    "title": "Base.show",
    "category": "method",
    "text": "show(p::SimulationPlot)\n\nDescription\n\nLaunch a browser and render the SimulationPlot plot p.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.plotvaluefunction",
    "page": "Reference",
    "title": "SDDP.plotvaluefunction",
    "category": "function",
    "text": " SDDP.plotvaluefunction(m::SDDPModel, stage::Int, markovstate::Int, states::Union{Float64, AbstractVector{Float64}}...; label1=\"State 1\", label2=\"State 2\")\n\nDescription\n\nPlot the value function of stage stage and Markov state markovstate in the SDDPModel m at the points in the discretized state space given by states. If the value in states is a real number, the state is evaluated at that point. If the value is a vector, the state is evaluated at all the points in the vector. At most two states can be vectors.\n\nExamples\n\nSDDP.plotvaluefunction(m, 2, 1, 0.0:0.1:1.0, 0.5, 0.0:0.1:1.0; label1=\"State 1\", label2=\"State 3\")\n\n\n\n"
},

{
    "location": "apireference.html#Understanding-the-solution-1",
    "page": "Reference",
    "title": "Understanding the solution",
    "category": "section",
    "text": "simulate\ngetbound\nnewplot\naddplot!\nshow(::SDDP.SimulationPlot)\nplotvaluefunction"
},

{
    "location": "apireference.html#SDDP.loadcuts!",
    "page": "Reference",
    "title": "SDDP.loadcuts!",
    "category": "function",
    "text": "loadcuts!(m::SDDPModel, filename::String)\n\nLoad cuts from the file created using the cut_output_file argument in solve.\n\nExample\n\nm = SDDPModel() do ... end\nstatus = solve(m; cut_output_file=\"path/to/m.cuts\")`\nm2 = SDDPModel() do ... end\nloadcuts!(m2, \"path/to/m.cuts\")\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.savemodel!",
    "page": "Reference",
    "title": "SDDP.savemodel!",
    "category": "function",
    "text": "SDDP.savemodel!(filename::String, m::SDDPModel)\n\nSave the SDDPModel m to the location filename. Can be loaded at a later date with m = SDDP.loadmodel(filename).\n\nNote: this function relies in the internal Julia Base.serializefunction. It should not be relied on to save an load models between versions of Julia (i.e between v0.5 and v0.6). For a longer-term solution, see SDDP.loadcuts! for help.\n\n\n\n"
},

{
    "location": "apireference.html#SDDP.loadmodel",
    "page": "Reference",
    "title": "SDDP.loadmodel",
    "category": "function",
    "text": "loadmodel(filename::String)\n\nLoad a model from the location filename that was saved using SDDP.savemodel!.\n\nNote: this function relies in the internal Julia Base.serializefunction. It should not be relied on to save an load models between versions of Julia (i.e between v0.5 and v0.6). For a longer-term solution, see SDDP.loadcuts! for help.\n\n\n\n"
},

{
    "location": "apireference.html#Read-and-write-the-model-to-disk-1",
    "page": "Reference",
    "title": "Read and write the model to disk",
    "category": "section",
    "text": "loadcuts!\nsavemodel!\nloadmodel"
},

]}
